// @ts-ignore
import appRaw from '../dist/server.cjs';
export default function handler(req: any, res: any) {
  const app = (appRaw as any).default || appRaw;
  return app(req, res);
}
