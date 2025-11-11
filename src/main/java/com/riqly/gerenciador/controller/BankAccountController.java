package com.riqly.gerenciador.controller;

import com.riqly.gerenciador.model.BankAccount;
import com.riqly.gerenciador.model.Card;
import com.riqly.gerenciador.service.BankAccountService;
import com.riqly.gerenciador.service.CardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/accounts")
public class BankAccountController {

    private final BankAccountService accountService;
    private final CardService cardService;

    public BankAccountController(BankAccountService accountService, CardService cardService) {
        this.accountService = accountService;
        this.cardService = cardService;
    }

    @PostMapping
    public ResponseEntity<BankAccount> create(@RequestBody BankAccount account) {
        BankAccount saved = accountService.save(account);
        return ResponseEntity.created(URI.create("/api/accounts/" + saved.getId())).body(saved);
    }

    @GetMapping
    public List<BankAccount> list() {
        return accountService.findAll();
    }

    @GetMapping("/{id}")
    public BankAccount get(@PathVariable Long id) { return accountService.findById(id); }

    @PutMapping("/{id}")
    public ResponseEntity<BankAccount> update(@PathVariable Long id, @RequestBody BankAccount account) {
        return ResponseEntity.ok(accountService.update(id, account));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        accountService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/cards")
    public List<Card> listCards(@PathVariable Long id) { return cardService.findByAccount(id); }

    @PostMapping("/{id}/cards")
    public ResponseEntity<Card> createCard(@PathVariable Long id, @RequestBody Card card) {
        Card saved = cardService.create(id, card);
        return ResponseEntity.created(URI.create("/api/cards/" + saved.getId())).body(saved);
    }
}
