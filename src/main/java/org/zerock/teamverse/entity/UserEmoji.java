package org.zerock.teamverse.entity;

import jakarta.persistence.*;

import lombok.Data;

@Entity
@Table(name = "user_emojis")
@Data

public class UserEmoji {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private String emojiId;
    
  // 기본 생성자 및 필요한 생성자 추가

  public Long getUserId() {
    return userId;
}

public void setUserId(Long userId) {
    this.userId = userId;
}

public String getEmojiId() {
    return emojiId;
}

public void setEmojiId(String emojiId) {
    this.emojiId = emojiId;
}


    


}
