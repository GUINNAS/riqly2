package com.riqly.gerenciador.controller;

import com.riqly.gerenciador.model.Transaction;
import com.riqly.gerenciador.service.TransactionService;
import com.riqly.gerenciador.dto.TransactionSummaryDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = {"http://localhost:8080", "http://localhost:5500"}, allowCredentials = "false")
public class TransactionController {

    private final TransactionService service;

    public TransactionController(TransactionService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<Transaction> create(@RequestBody Transaction tx) {
        Transaction saved = service.save(tx);
        return ResponseEntity.created(URI.create("/api/transactions/" + saved.getId())).body(saved);
    }

    @GetMapping
    public List<Transaction> list() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public Transaction get(@PathVariable Long id) {
        return service.findById(id);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Transaction> update(@PathVariable Long id, @RequestBody Transaction tx) {
        Transaction updated = service.update(id, tx);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/summary")
    public TransactionSummaryDTO summary(@RequestParam("month") String month) {
        // Expect month format YYYY-MM
        try {
            var ym = java.time.YearMonth.parse(month);
            return service.summaryForMonth(ym);
        } catch (Exception e) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "Formato de mês inválido. Use YYYY-MM");
        }
    }
}
