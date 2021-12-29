export interface AuditTrailModel {
  entryPoint: string;
  module: string;
  action: string;
  eventType?: string;
  user?: string;
  time: any;
}