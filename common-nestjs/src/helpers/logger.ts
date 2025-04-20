import { Injectable, LoggerService } from '@nestjs/common';

@Injectable()
export class CommonLogger implements LoggerService {
  private formatString(message: unknown, ...optionalParams: any[]): unknown {
    return typeof message === 'string' ? message.replace(/{([0-9]+)}/g, (match, index) => (typeof optionalParams[index] === 'undefined' ? match : optionalParams[index])) : message;
  }

  private logToConsole(level: string, message: unknown, ...optionalParams: any): void {
    const parameter = optionalParams[0] || [];
    // eslint-disable-next-line no-console
    console.log(`${new Date().toISOString()} [${level}] [${parameter[parameter.length - 1]}] ${this.formatString(message, parameter)}`);
  }

  public log(message: any, ...optionalParams: any): void {
    this.logToConsole('LOG    ', message, optionalParams);
  }

  public error(message: any, ...optionalParams: any): void {
    this.logToConsole('ERROR  ', message, optionalParams);
  }

  public warn(message: any, ...optionalParams: any): void {
    this.logToConsole('WARN   ', message, optionalParams);
  }

  public debug?(message: any, ...optionalParams: any): void {
    this.logToConsole('DEBUG  ', message, optionalParams);
  }

  public verbose?(message: any, ...optionalParams: any): void {
    this.logToConsole('VERBOSE', message, optionalParams);
  }
}
