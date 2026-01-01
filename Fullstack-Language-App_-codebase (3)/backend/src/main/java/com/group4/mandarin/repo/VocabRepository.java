package com.group4.mandarin.repo;

import com.group4.mandarin.model.Vocab;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface VocabRepository extends JpaRepository<Vocab, Long> {
    @Query("SELECT v FROM Vocab v WHERE lower(v.word) LIKE lower(concat('%', :q, '%')) OR lower(v.pinyin) LIKE lower(concat('%', :q, '%')) OR lower(v.translation) LIKE lower(concat('%', :q, '%'))")
    List<Vocab> search(@Param("q") String q);
}