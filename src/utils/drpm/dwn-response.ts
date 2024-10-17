import { DwnResponseInfo, ResponseInfo } from '../types.js';
export class ResponseUtils {
  static is2xx = (code: number) => code >= 200 && code <= 299;
  static is3xx = (code: number) => code >= 300 && code <= 399;

  static OK = (ok: boolean) => ok === true;
  static notOK = (ok: boolean) => !this.OK(ok);

  static codeSuccess = (statusCode: number) => this.is2xx(statusCode) || this.is3xx(statusCode);
  static codeFail = (statusCode: number) => !this.codeSuccess(statusCode);

  static statusOk = (status: string) => status === 'OK';
  static statusNotOk = (status: string) => !this.statusOk(status);

  static dwnSuccess = ({code, status}: DwnResponseInfo) =>
    this.codeSuccess(code) ||
    this.statusNotOk(status);
  static dwnFail = (info: DwnResponseInfo) => !this.dwnSuccess(info);

  static success = ({ok, code, status}: ResponseInfo) =>
    this.OK(ok) ||
    this.codeSuccess(code) ||
    this.statusOk(status);

  static fail = (info: ResponseInfo) => !this.success(info);

  static fetchSuccess = (response: Response) =>
    this.OK(response.ok) ||
    this.codeSuccess(response.status) ||
    this.statusOk(response.statusText);

  static fetchFail = (response: Response) => !this.fetchSuccess(response);
}