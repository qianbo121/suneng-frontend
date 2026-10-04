"""Real loopback HTTP failure fixtures and Node transport for the release helper."""
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
import shutil
import subprocess
import threading
import unittest
from unittest.mock import patch
import acquisition_continuity as a

NODE = shutil.which('node') or '/opt/homebrew/opt/node@22/bin/node'
CHECKER = Path(__file__).with_name('acquisition-continuity.mjs')
PAGES = json.loads(Path(__file__).with_name('approved-guides.json').read_text())
TOPICS = ['单台工业炉报价', '老旧热处理炉', '连续热处理生产线', '江苏工业炉厂家', '热处理炉厂家', '改造风险与停产安排', '控制系统升级', '能源切换与余热利用', '炉衬损坏与翻新', '停产与搬迁复产', '温度不均整改']
# Topic order follows the exact checker, not the release allowlist ordering.
CHECKER_PATHS = ['/zh/articles/gongye-lu-baojia-canshu', '/zh/articles/laojiu-rechuli-lu-daxiu-haishi-maixin', '/zh/solutions/continuous-heat-treatment-line', '/zh/solutions/jiangsu-gongye-lu-changjia', '/zh/solutions/rechuli-lu-changjia', '/zh/solutions/rechuli-lu-gaizao-fengxian-zhouqi', '/zh/solutions/rechuli-lu-kongzhi-xitong-shengji', '/zh/solutions/rechuli-lu-dian-gai-ran-yure-huishou', '/zh/solutions/rechuli-lu-luchen-fanxin', '/zh/solutions/rechuli-lu-tingchan-chongqi-banqian-fuchan', '/zh/solutions/rechuli-lu-wendu-bujun-zhenggai']


class AcquisitionTransportTest(unittest.TestCase):
    def test_shipped_checker_is_exact_source_copy(self):
        original = Path(__file__).resolve().parents[2] / 'frontend/scripts/check-acquisition-continuity.mjs'
        self.assertEqual(CHECKER.read_bytes(), original.read_bytes())
        self.assertEqual(set(CHECKER_PATHS), set(PAGES))

    def site_check(self, fault=None):
        requests = []
        target = CHECKER_PATHS[0]
        class Handler(BaseHTTPRequestHandler):
            def log_message(self, *args): pass
            def do_GET(self):
                requests.append(self.path)
                status = 200
                if self.path == '/sitemap.xml':
                    paths = [p for p in PAGES if not (fault == 'sitemap' and p == target)]
                    body = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + ''.join('<url><loc>'+a.PUBLIC_ORIGIN+p+'</loc></url>' for p in paths) + '</urlset>'
                    content_type = 'application/xml'
                elif self.path in CHECKER_PATHS:
                    topic = TOPICS[CHECKER_PATHS.index(self.path)]
                    changed = self.path == target
                    canonical = a.PUBLIC_ORIGIN + ('/zh/products' if changed and fault == 'canonical' else self.path)
                    h1 = '错误主题' if changed and fault == 'h1' else topic
                    text = '占位' if changed and fault == 'content' else '采购技术资料正文' * 80
                    toolbar = '' if changed and fault == 'contact' else '<aside data-contact-toolbar><a href="tel:13052986814">拨打电话</a><button aria-haspopup="dialog">微信联系</button></aside>'
                    body = '<html><head><link rel="canonical" href="'+canonical+'">'+('<meta name="robots" content="noindex">' if changed and fault == 'noindex' else '')+'</head><body><main><h1>'+h1+'</h1><p>'+text+'</p></main>'+toolbar+'</body></html>'
                    if changed and fault == '404': status = 404
                    content_type = 'text/html'
                else:
                    status, body, content_type = 404, '', 'text/html'
                self.send_response(status);self.send_header('Content-Type', content_type);self.end_headers();self.wfile.write(body.encode())
            def do_POST(self):
                raise AssertionError('The release checker must never submit a form')
        server = ThreadingHTTPServer(('127.0.0.1', 0), Handler)
        thread = threading.Thread(target=server.serve_forever, daemon=True);thread.start()
        base = 'http://127.0.0.1:'+str(server.server_port)
        original_run = subprocess.run
        def node_transport(command, **kwargs):
            self.assertEqual(command, ['docker', 'exec', '-i', 'candidate', 'node', '--input-type=module', '-'])
            self.assertIn('"baseUrl": "'+base+'"', kwargs['input'])
            self.assertNotIn(a.PUBLIC_ORIGIN+'/sitemap.xml', kwargs['input'])
            kwargs['timeout'] = 15
            return original_run([NODE, '--input-type=module', '-'], **kwargs)
        try:
            with patch.object(a, 'CANDIDATE_ORIGIN', base), patch.object(a.subprocess, 'run', side_effect=node_transport):
                report = a.acquisition_continuity_probe('candidate')
            self.assertEqual(len(requests), 12)
            self.assertTrue(all(path in PAGES or path == '/sitemap.xml' for path in requests))
            self.assertEqual(report['releasePhase'], 'candidate')
            self.assertFalse(any('尚未接入部署流水线' in item for item in report['limitations']))
            return report
        finally:
            server.shutdown();server.server_close();thread.join()

    def test_real_http_good_contract(self):
        report = self.site_check()
        self.assertTrue(report['passed'])
        self.assertEqual(report['pagesChecked'], 11)

    def test_real_http_failures_are_not_hidden_by_http_200(self):
        for fault, name in [('404','http'), ('noindex','indexable'), ('canonical','canonical'), ('h1','content'), ('content','content'), ('contact','contactToolbar'), ('sitemap','sitemap')]:
            with self.subTest(fault=fault):
                report = self.site_check(fault)
                self.assertFalse(report['passed'])
                failed = next(p for p in report['pages'] if p['path'] == CHECKER_PATHS[0])
                self.assertFalse(failed['checks'][name]['passed'])

    def test_declared_success_with_only_status_or_wrong_paths_is_rejected(self):
        report = {'baseUrl':a.CANDIDATE_ORIGIN, 'canonicalOrigin':a.PUBLIC_ORIGIN,'passed':True,
                  'pagesChecked':11,'failedPages':0,'sitemap':{'passed':True},
                  'pages':[{'path':p,'status':200,'passed':True,'checks':{'http':{'passed':True}}} for p in PAGES]}
        for change in [False, True]:
            if change:report['pages'][0]['path']='/zh/case/withdrawn'
            result = subprocess.CompletedProcess([],0,stdout=json.dumps(report))
            with patch.object(a.subprocess,'run',return_value=result), self.assertRaises(RuntimeError):
                a.acquisition_continuity_probe('candidate')
