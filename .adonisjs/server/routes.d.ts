import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'apps.landing': { paramsTuple?: []; params?: {} }
    'apps.contest_detail': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'apps.store_submission': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'apps.public_vote': { paramsTuple: [ParamValue]; params: {'submissionId': ParamValue} }
    'apps.jury_vote': { paramsTuple: [ParamValue]; params: {'submissionId': ParamValue} }
    'apps.admin_dashboard': { paramsTuple?: []; params?: {} }
    'apps.admin_contest_detail': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'apps.update_contest': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'apps.store_contest': { paramsTuple?: []; params?: {} }
    'apps.delete_contest': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'apps.delete_submission': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'session.create': { paramsTuple?: []; params?: {} }
    'session.store': { paramsTuple?: []; params?: {} }
    'session.destroy': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'apps.landing': { paramsTuple?: []; params?: {} }
    'apps.contest_detail': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'apps.admin_dashboard': { paramsTuple?: []; params?: {} }
    'apps.admin_contest_detail': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'session.create': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'apps.landing': { paramsTuple?: []; params?: {} }
    'apps.contest_detail': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'apps.admin_dashboard': { paramsTuple?: []; params?: {} }
    'apps.admin_contest_detail': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'session.create': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'apps.store_submission': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'apps.public_vote': { paramsTuple: [ParamValue]; params: {'submissionId': ParamValue} }
    'apps.jury_vote': { paramsTuple: [ParamValue]; params: {'submissionId': ParamValue} }
    'apps.update_contest': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'apps.store_contest': { paramsTuple?: []; params?: {} }
    'session.store': { paramsTuple?: []; params?: {} }
    'session.destroy': { paramsTuple?: []; params?: {} }
  }
  DELETE: {
    'apps.delete_contest': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'apps.delete_submission': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}