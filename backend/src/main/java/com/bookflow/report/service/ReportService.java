package com.bookflow.report.service;

import com.bookflow.report.dto.response.DailyReportResponse;
import com.bookflow.report.dto.response.MonthlyReportResponse;

import java.time.LocalDate;

public interface ReportService {

    DailyReportResponse getDailyReport(
        Long companyId,
        LocalDate date
    );

    MonthlyReportResponse getMonthlyReport(
        Long companyId,
        int year,
        int month
    );
}
