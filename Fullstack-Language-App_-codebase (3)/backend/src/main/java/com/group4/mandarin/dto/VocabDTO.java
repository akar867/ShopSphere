package com.group4.mandarin.dto;

import javax.validation.constraints.NotBlank;

public class VocabDTO {
    @NotBlank
    private String word;
    @NotBlank
    private String pinyin;
    @NotBlank
    private String translation;
    private String audioUrl;
    private String videoUrl;
    private String difficulty;

    public String getWord() { return word; }
    public void setWord(String word) { this.word = word; }
    public String getPinyin() { return pinyin; }
    public void setPinyin(String pinyin) { this.pinyin = pinyin; }
    public String getTranslation() { return translation; }
    public void setTranslation(String translation) { this.translation = translation; }
    public String getAudioUrl() { return audioUrl; }
    public void setAudioUrl(String audioUrl) { this.audioUrl = audioUrl; }
    public String getVideoUrl() { return videoUrl; }
    public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }
    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
}