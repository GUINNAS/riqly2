package com.riqly.gerenciador.service;

import com.riqly.gerenciador.model.Transaction;
import com.riqly.gerenciador.repository.TransactionRepository;
import com.riqly.gerenciador.dto.TransactionSummaryDTO;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class TransactionService {

    private final TransactionRepository repository;

    public TransactionService(TransactionRepository repository) {
        this.repository = repository;
    }

    public Transaction save(Transaction tx) {
        return repository.save(tx);
    }

    public List<Transaction> findAll() {
        return repository.findAll();
    }

    public Transaction findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction not found"));
    }

    public Transaction update(Long id, Transaction tx) {
        return repository.findById(id).map(existing -> {
            existing.setType(tx.getType());
            existing.setAmount(tx.getAmount());
            existing.setDescription(tx.getDescription());
            existing.setDate(tx.getDate());
            existing.setCategory(tx.getCategory());
            existing.setRecurring(tx.isRecurring());
            return repository.save(existing);
        }).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction not found"));
    }

    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction not found");
        }
        repository.deleteById(id);
    }

    public TransactionSummaryDTO summaryForMonth(YearMonth yearMonth) {
        LocalDate start = yearMonth.atDay(1);
        LocalDate end = yearMonth.atEndOfMonth();
        var list = repository.findByDateBetween(start, end);

        BigDecimal totalIncome = list.stream()
                .filter(t -> "RECEITA".equalsIgnoreCase(t.getType()))
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalExpenses = list.stream()
                .filter(t -> "DESPESA".equalsIgnoreCase(t.getType()))
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal net = totalIncome.subtract(totalExpenses);

        Map<String, BigDecimal> byCategory = list.stream()
                .filter(t -> "DESPESA".equalsIgnoreCase(t.getType()))
                .collect(Collectors.groupingBy(t -> t.getCategory() == null ? "sem-categoria" : t.getCategory(),
                        Collectors.mapping(Transaction::getAmount, Collectors.reducing(BigDecimal.ZERO, BigDecimal::add))));

        var dto = new TransactionSummaryDTO();
        dto.setMonth(yearMonth.toString());
        dto.setTotalTransactions(list.size());
        dto.setTotalIncome(totalIncome);
        dto.setTotalExpenses(totalExpenses);
        dto.setNetBalance(net);
        dto.setCategoryBreakdown(byCategory.entrySet().stream()
                .map(e -> new TransactionSummaryDTO.CategoryAmountDTO(e.getKey(), e.getValue()))
                .sorted((a,b) -> b.getAmount().compareTo(a.getAmount()))
                .collect(Collectors.toList()));
        return dto;
    }
}
