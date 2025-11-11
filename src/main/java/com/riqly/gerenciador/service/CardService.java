package com.riqly.gerenciador.service;

import com.riqly.gerenciador.model.BankAccount;
import com.riqly.gerenciador.model.Card;
import com.riqly.gerenciador.repository.BankAccountRepository;
import com.riqly.gerenciador.repository.CardRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class CardService {

    private final CardRepository cardRepository;
    private final BankAccountRepository accountRepository;

    public CardService(CardRepository cardRepository, BankAccountRepository accountRepository) {
        this.cardRepository = cardRepository;
        this.accountRepository = accountRepository;
    }

    public List<Card> findAll() { return cardRepository.findAll(); }

    public Card findById(Long id) {
        return cardRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Card not found"));
    }

    public List<Card> findByAccount(Long accountId) {
        BankAccount acc = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Bank account not found"));
        return cardRepository.findByBankAccount(acc);
    }

    public Card create(Long accountId, Card toCreate) {
        BankAccount acc = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Bank account not found"));
        toCreate.setBankAccount(acc);
        return cardRepository.save(toCreate);
    }

    public Card createByRef(Long accountId, String description, String lastDigits) {
        BankAccount acc = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Bank account not found"));
        Card c = new Card();
        c.setDescription(description);
        c.setLastDigits(lastDigits);
        c.setBankAccount(acc);
        return cardRepository.save(c);
    }

    public Card update(Long id, Long accountId, Card patch) {
        return cardRepository.findById(id).map(existing -> {
            if (accountId != null) {
                BankAccount acc = accountRepository.findById(accountId)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Bank account not found"));
                existing.setBankAccount(acc);
            }
            existing.setDescription(patch.getDescription());
            existing.setLastDigits(patch.getLastDigits());
            return cardRepository.save(existing);
        }).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Card not found"));
    }

    public void delete(Long id) {
        if (!cardRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Card not found");
        }
        cardRepository.deleteById(id);
    }
}
