package com.group4.mandarin.controller;

import com.group4.mandarin.dto.VocabDTO;
import com.group4.mandarin.model.Vocab;
import com.group4.mandarin.repo.VocabRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/vocab")
public class VocabController {

    @Autowired private VocabRepository vocabRepository;

    @GetMapping
    public List<Vocab> list(@RequestParam(value = "q", required = false) String q) {
        if (q == null || q.trim().isEmpty()) return vocabRepository.findAll();
        return vocabRepository.search(q.trim());
    }

    @PostMapping
    public ResponseEntity<Vocab> create(@RequestBody @Valid VocabDTO dto) {
        Vocab v = new Vocab();
        v.setWord(dto.getWord());
        v.setPinyin(dto.getPinyin());
        v.setTranslation(dto.getTranslation());
        v.setAudioUrl(dto.getAudioUrl());
        v.setVideoUrl(dto.getVideoUrl());
        v.setDifficulty(dto.getDifficulty() == null ? "easy" : dto.getDifficulty());
        return ResponseEntity.ok(vocabRepository.save(v));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody VocabDTO dto) {
        return vocabRepository.findById(id).map(v -> {
            if (dto.getWord() != null) v.setWord(dto.getWord());
            if (dto.getPinyin() != null) v.setPinyin(dto.getPinyin());
            if (dto.getTranslation() != null) v.setTranslation(dto.getTranslation());
            if (dto.getAudioUrl() != null) v.setAudioUrl(dto.getAudioUrl());
            if (dto.getVideoUrl() != null) v.setVideoUrl(dto.getVideoUrl());
            if (dto.getDifficulty() != null) v.setDifficulty(dto.getDifficulty());
            return ResponseEntity.ok(vocabRepository.save(v));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!vocabRepository.existsById(id)) return ResponseEntity.notFound().build();
        vocabRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}