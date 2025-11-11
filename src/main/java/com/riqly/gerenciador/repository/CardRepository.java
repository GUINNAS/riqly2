package com.riqly.gerenciador.repository;

import com.riqly.gerenciador.model.Card;
import com.riqly.gerenciador.model.BankAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CardRepository extends JpaRepository<Card, Long> {
    List<Card> findByBankAccount(BankAccount bankAccount);
}
