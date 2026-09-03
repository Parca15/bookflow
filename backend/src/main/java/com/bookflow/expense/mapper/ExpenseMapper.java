package com.bookflow.expense.mapper;

import com.bookflow.expense.dto.response.ExpenseResponse;
import com.bookflow.expense.entity.Expense;
import org.springframework.stereotype.Component;

@Component
public class ExpenseMapper {

    public ExpenseResponse toResponse(Expense e) {
        ExpenseResponse r = new ExpenseResponse();
        r.setId(e.getId());
        r.setCompanyId(e.getCompany().getId());
        r.setCashRegisterId(e.getCashRegister().getId());
        r.setAmount(e.getAmount());
        r.setExpenseDate(e.getExpenseDate());
        r.setCategory(e.getCategory());
        r.setPaymentMethod(e.getPaymentMethod());
        r.setDescription(e.getDescription());
        return r;
    }
}
