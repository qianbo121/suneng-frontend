import argparse,json,re,subprocess,tempfile,socket,pathlib,time,signal
parser=argparse.ArgumentParser(description='Verify login rules and graceful reload using loopback-only fixtures.')
parser.add_argument('--nginx', required=True, help='Path to an installed native Nginx executable')
args=parser.parse_args()
root=pathlib.Path(__file__).resolve().parents[1]
nginx=args.nginx
source=(root/'nginx.prod.conf.template').read_text()
map_rule=re.search(r'map \$uri \$admin_login_key\s*\{[^}]+\}',source).group()
zone=re.search(r'limit_req_zone \$admin_login_key[^;]+;',source).group()
limit=re.search(r'location \^~ /api/admin/\s*\{\s*(limit_req[^;]+;)',source).group(1)
with socket.socket() as s:
    s.bind(('127.0.0.1',0));port=s.getsockname()[1]
with socket.socket() as s:
    s.bind(('127.0.0.1',0));up=s.getsockname()[1]
results=[]
with tempfile.TemporaryDirectory(prefix='suneng-login-reload-') as directory:
    d=pathlib.Path(directory);(d/'logs').mkdir();cfg=d/'nginx.conf'
    def config(candidate):
        rules=map_rule+'\n'+zone if candidate else 'limit_req_zone $binary_remote_addr zone=admin_login:10m rate=5r/m;'
        locations=f'location ^~ /api/admin/ {{{limit} proxy_pass http://backend_upstream;}}' if candidate else 'location = /api/admin/auth/login {limit_req zone=admin_login burst=3 nodelay;proxy_pass http://backend_upstream;} location ^~ /api/admin/ {proxy_pass http://backend_upstream;}'
        version='candidate' if candidate else 'legacy'
        return f"""worker_processes 1; pid {d}/nginx.pid; error_log {d}/errors.log notice;
events {{worker_connections 128;}}
http {{access_log off; {rules}
upstream backend_upstream {{server 127.0.0.1:{up};}}
server {{listen 127.0.0.1:{up};location / {{return 204;}}}}
server {{listen 127.0.0.1:{port}; location = /fixture-version {{return 200 '{version}';}}
location = /api/admin/custom-requirements {{return 410;}}
{locations} location /api/svc/ {{return 404;}}
}}
}}
"""
    def request(path,expected=None):
        r=subprocess.run(['curl','--noproxy','*','--silent','--show-error','--max-time','2','--request','POST','--output','/dev/null','--write-out','%{http_code}',f'http://127.0.0.1:{port}'+path],capture_output=True,text=True,check=True)
        status=int(r.stdout)
        if expected is not None:
            results.append({'path':path,'expected':expected,'actual':status})
            assert status==expected,results[-1]
        return status
    cfg.write_text(config(False))
    subprocess.run([nginx,'-p',str(d)+'/', '-c',str(cfg),'-t'],check=True,capture_output=True)
    process=subprocess.Popen([nginx,'-p',str(d)+'/', '-c',str(cfg),'-g','daemon off;'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    try:
        for _ in range(30):
            try:
                with socket.create_connection(('127.0.0.1',port),timeout=.1):break
            except OSError:time.sleep(.1)
        request('/api/admin/auth/LOGIN/',204)
        pid=process.pid
        cfg.write_text(config(True))
        subprocess.run([nginx,'-p',str(d)+'/', '-c',str(cfg),'-t'],check=True,capture_output=True)
        process.send_signal(signal.SIGHUP)
        for _ in range(30):
            response=subprocess.check_output(['curl','--noproxy','*','--silent','--max-time','2',f'http://127.0.0.1:{port}/fixture-version'],text=True)
            if response=='candidate':break
            time.sleep(.1)
        else:raise AssertionError((d/'errors.log').read_text())
        assert process.poll() is None and process.pid==pid
        for path in ['/api/admin/auth/login','/api/admin/auth/login/','/api/admin/auth/LOGIN','/api/admin/Auth/LoGiN/']:request(path,204)
        for path in ['/api/admin/auth/login','/api/admin/auth/login/','/api/admin/auth/LOGIN','/api/admin/Auth/LoGiN/','/api/admin/auth/login?variant=1','/api/admin/auth/%6cogin']:request(path,503)
        for _ in range(8):
            request('/api/admin/auth/me',204);request('/api/admin/custom-requirements/search',204)
        request('/api/admin/custom-requirements',410);request('/api/svc/test',404)
        assert 'while previously it used' not in (d/'errors.log').read_text()
        report={'passed':True,'checks':len(results),'legacyToNewRuleGracefulReloadPassed':True,'masterProcessUnchanged':True,'productionRulesExtracted':{'map':map_rule,'zone':zone,'limit':limit},'scope':'login map and rate limit plus neighboring admin paths; not full production template or TLS verification','productionRequestsSent':False,'results':results}
        print(json.dumps(report,ensure_ascii=False,indent=2))
    finally:
        process.send_signal(signal.SIGQUIT)
        try:process.wait(timeout=8)
        except subprocess.TimeoutExpired:
            process.terminate();process.wait(timeout=5)
