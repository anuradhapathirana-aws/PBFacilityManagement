import * as reportService from '../services/report.service.js';

export const daily = async (req, res) => res.json(await reportService.dailyReport(req.valid.query.date));

export const dailyCsv = async (req, res) => {
  const report = await reportService.dailyReport(req.valid.query.date);
  res
    .type('text/csv; charset=utf-8')
    .attachment(`CleaningOS_Daily_Report_${report.date}.csv`)
    .send(reportService.reportToCsv(report));
};

export const dashboard = async (_req, res) => res.json(await reportService.dashboard());
