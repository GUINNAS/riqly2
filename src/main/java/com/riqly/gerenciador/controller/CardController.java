package com.riqly.gerenciador.controller;

import com.riqly.gerenciador.model.Card;
import com.riqly.gerenciador.service.CardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/cards")
public class CardController {

    private final CardService cardService;

    public CardController(CardService cardService) {
        this.cardService = cardService;
    }

    @GetMapping
    public List<Card> list() { return cardService.findAll(); }

    @GetMapping("/{id}")
    public Card get(@PathVariable Long id) { return cardService.findById(id); }

    @PostMapping
    public ResponseEntity<Card> create(@RequestParam("accountId") Long accountId,
                                       @RequestBody Card card) {
        Card saved = cardService.create(accountId, card);
        return ResponseEntity.created(URI.create("/api/cards/" + saved.getId())).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Card> update(@PathVariable Long id,
                                       @RequestParam(value = "accountId", required = false) Long accountId,
                                       @RequestBody Card card) {
        return ResponseEntity.ok(cardService.update(id, accountId, card));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        cardService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
