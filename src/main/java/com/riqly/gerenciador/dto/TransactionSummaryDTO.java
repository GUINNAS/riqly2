package com.riqly.gerenciador.dto;

import java.math.BigDecimal;
import java.util.List;

public class TransactionSummaryDTO {
    private String month; // YYYY-MM
    private long totalTransactions;
    private BigDecimal totalExpenses;
    private BigDecimal totalIncome;
    private BigDecimal netBalance; // income - expenses
    private List<CategoryAmountDTO> categoryBreakdown; // despesas por categoria

    public TransactionSummaryDTO() {}

    public String getMonth() { return month; }
    public void setMonth(String month) { this.month = month; }
    public long getTotalTransactions() { return totalTransactions; }
    public void setTotalTransactions(long totalTransactions) { this.totalTransactions = totalTransactions; }
    public BigDecimal getTotalExpenses() { return totalExpenses; }
    public void setTotalExpenses(BigDecimal totalExpenses) { this.totalExpenses = totalExpenses; }
    public BigDecimal getTotalIncome() { return totalIncome; }
    public void setTotalIncome(BigDecimal totalIncome) { this.totalIncome = totalIncome; }
    public BigDecimal getNetBalance() { return netBalance; }
    public void setNetBalance(BigDecimal netBalance) { this.netBalance = netBalance; }
    public List<CategoryAmountDTO> getCategoryBreakdown() { return categoryBreakdown; }
    public void setCategoryBreakdown(List<CategoryAmountDTO> categoryBreakdown) { this.categoryBreakdown = categoryBreakdown; }

    public static class CategoryAmountDTO {
        private String category;
        private BigDecimal amount;

        public CategoryAmountDTO() {}

        public CategoryAmountDTO(String category, BigDecimal amount) {
            this.category = category; this.amount = amount;
        }

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }
    }
}
