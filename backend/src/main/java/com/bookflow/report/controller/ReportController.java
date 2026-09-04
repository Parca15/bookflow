package com.bookflow.report.controller;

import com.bookflow.report.dto.response.DailyReportResponse;
import com.bookflow.report.dto.response.DashboardSummaryResponse;
import com.bookflow.report.dto.response.MonthlyReportResponse;
import com.bookflow.report.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/companies/{companyId}/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/daily")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or hasRole('MANAGER') or hasRole('RECEPTIONIST')")
    public DailyReportResponse getDailyReport(
        @PathVariable Long companyId,
        @RequestParam
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
        LocalDate date
    ) {

        return reportService.getDailyReport(
            companyId,
            date
        );
    }

    @GetMapping("/monthly")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or hasRole('MANAGER') or hasRole('RECEPTIONIST')")
    public MonthlyReportResponse getMonthlyReport(
        @PathVariable Long companyId,
        @RequestParam int year,
        @RequestParam int month
    ) {

        return reportService.getMonthlyReport(
            companyId,
            year,
            month
        );
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or hasRole('MANAGER') or hasRole('RECEPTIONIST')")
    public DashboardSummaryResponse getDashboardSummary(
        @PathVariable Long companyId
    ) {
        return reportService.getDashboardSummary(companyId);
    }
}
