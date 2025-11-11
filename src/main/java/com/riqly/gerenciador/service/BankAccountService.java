package com.riqly.gerenciador.service;

import com.riqly.gerenciador.model.BankAccount;
import com.riqly.gerenciador.repository.BankAccountRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class BankAccountService {

    private final BankAccountRepository repository;

    public BankAccountService(BankAccountRepository repository) {
        this.repository = repository;
    }

    public BankAccount save(BankAccount account) { return repository.save(account); }

    public List<BankAccount> findAll() { return repository.findAll(); }

    public BankAccount findById(Long id) {
        return repository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Bank account not found"));
    }

    public BankAccount update(Long id, BankAccount updated) {
        return repository.findById(id).map(acc -> {
            acc.setBankName(updated.getBankName());
            acc.setDescription(updated.getDescription());
            acc.setAccountNumber(updated.getAccountNumber());
            return repository.save(acc);
        }).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Bank account not found"));
    }

    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Bank account not found");
        }
        repository.deleteById(id);
    }
}
