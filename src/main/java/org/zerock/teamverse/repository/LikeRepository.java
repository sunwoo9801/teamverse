package org.zerock.teamverse.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.zerock.teamverse.entity.Like;
import org.zerock.teamverse.entity.LikeType;
import org.zerock.teamverse.entity.Task;
import org.zerock.teamverse.entity.User;
import org.zerock.teamverse.entity.ActivityLog;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

public interface LikeRepository extends JpaRepository<Like, Long> {

  // 기존에 저장된 특정 사용자와 액티비티(게시글)와 연결된 모든 리액션 찾기
  @Query("SELECT l FROM Like l WHERE l.user = :user AND l.activity = :activity")
  Optional<Like> findByUserAndActivity(@Param("user") User user, @Param("activity") ActivityLog activity);

  // 기존에 저장된 특정 사용자와 태스크(업무)와 연결된 모든 리액션 찾기
  @Query("SELECT l FROM Like l WHERE l.user = :user AND l.task = :task")
  Optional<Like> findByUserAndTask(@Param("user") User user, @Param("task") Task task);

  @Query("SELECT COUNT(l) FROM Like l WHERE l.activity.id = :activityId")
  int getTotalLikes(@Param("activityId") Long activityId);

  /**
   * 🔹 특정 활동(게시물)의 총 리액션 개수 조회
   */
  @Query("SELECT COUNT(l) FROM Like l WHERE l.activity.id = :activityId")
  int countByActivityId(@Param("activityId") Long activityId);

  /**
   * 🔹 특정 활동(게시물)의 감정별 개수 조회
   */

  @Query("SELECT l.type, COUNT(l) FROM Like l WHERE l.activity.id = :activityId GROUP BY l.type")
  List<Object[]> getReactionCounts(@Param("activityId") Long activityId);

  // 특정 활동(Activity)에 대한 리액션 개수 조회
  @Query("SELECT l.type, COUNT(l.id) FROM Like l WHERE l.activity.id = :activityId GROUP BY l.type")
  List<Object[]> findReactionCountsByActivity(@Param("activityId") Long activityId);

  // 결과를 Map<String, Integer>로 변환하는 기본 메서드 추가
  default Map<String, Integer> getReactionCountsByActivity(Long activityId) {
    return findReactionCountsByActivity(activityId).stream()
        .collect(Collectors.toMap(
            obj -> ((LikeType) obj[0]).name(), // LikeType을 String으로 변환
            obj -> ((Number) obj[1]).intValue() // 개수를 Integer로 변환
        ));
  }

  @Query("SELECT l.type, COUNT(l) FROM Like l WHERE l.task.id = :taskId GROUP BY l.type")
  List<Object[]> getReactionCountsForTask(@Param("taskId") Long taskId);

  @Query("SELECT l.type, COUNT(l) FROM Like l WHERE l.task.id = :taskId GROUP BY l.type")
  List<Object[]> getReactionCountsByTask(@Param("taskId") Long taskId);

}
