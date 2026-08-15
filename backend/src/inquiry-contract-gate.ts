import {
  INQUIRY_CONTRACT_VERSION,
  supportsInquiryContract,
  supportsShujuInquiryConsumer,
} from '@/modules/custom-requirement/inquiry-contract';

async function readJson(url: string) {
  const response = await fetch(url, { signal: AbortSignal.timeout(3_000) });
  if (!response.ok) throw new Error(`Health endpoint returned ${response.status}`);
  return response.json();
}

async function main() {
  const mode = process.argv[2];
  if (mode === 'image') return INQUIRY_CONTRACT_VERSION >= 2;
  if (mode === 'health') {
    return supportsInquiryContract(
      await readJson(process.argv[3] ?? 'http://127.0.0.1:3001/api/health'),
    );
  }
  if (mode === 'shuju-health') {
    const expectedStartAfterId = Number(process.argv[4]);
    return supportsShujuInquiryConsumer(
      await readJson(process.argv[3] ?? 'http://shuju:18321/api/ready'),
      expectedStartAfterId,
    );
  }
  return false;
}

if (process.argv[1]?.endsWith('/inquiry-contract-gate.js')) {
  void main()
    .then((ok) => {
      if (!ok) process.exitCode = 1;
    })
    .catch(() => {
      process.exitCode = 1;
    });
}
