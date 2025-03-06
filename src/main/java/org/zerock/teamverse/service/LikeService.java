package org.zerock.teamverse.service;

import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import org.zerock.teamverse.entity.*;
import org.zerock.teamverse.repository.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class LikeService {
    private final LikeRepository likeRepository;
    private final UserRepository userRepository;
    private final ActivityLogRepository activityLogRepository;
    private final TaskRepository taskRepository;

    public LikeService(LikeRepository likeRepository, UserRepository userRepository,
            ActivityLogRepository activityLogRepository, TaskRepository taskRepository) {
        this.likeRepository = likeRepository;
        this.userRepository = userRepository;
        this.activityLogRepository = activityLogRepository;
        this.taskRepository = taskRepository;
    }

    // @Transactional
    // public boolean toggleReaction(Long userId, Long activityId, Long taskId,
    // LikeType type) {
    // if (activityId == null && taskId == null) {
    // throw new IllegalArgumentException("activityId 또는 taskId 중 하나는 반드시 제공되어야
    // 합니다.");
    // }

    // User user = userRepository.findById(userId)
    // .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

    // Optional<Like> existingLike;
    // if (activityId != null) {
    // existingLike = likeRepository.findByUserAndActivityAndType(user,
    // activityLogRepository.findById(activityId).orElseThrow(), type);
    // } else {
    // existingLike = likeRepository.findByUserAndTask(user,
    // taskRepository.findById(taskId).orElseThrow());
    // }

    // // 기존 리액션이 있다면 삭제
    // if (existingLike.isPresent()) {
    // likeRepository.delete(existingLike.get());
    // return false;
    // }

    // Like newLike = new Like();
    // newLike.setUser(user);
    // newLike.setType(type);

    // if (activityId != null) {
    // newLike.setActivity(activityLogRepository.findById(activityId).orElseThrow());
    // newLike.setTask(null);
    // } else if (taskId != null) {
    // newLike.setTask(taskRepository.findById(taskId).orElseThrow());
    // newLike.setActivity(null);
    // }

    // // ✅ 저장할 데이터 확인
    // System.out.println("📌 저장할 Like 객체 - activityId: " +
    // (newLike.getActivity() != null ? newLike.getActivity().getId() : "NULL") +
    // ", taskId: " + (newLike.getTask() != null ? newLike.getTask().getId() :
    // "NULL"));

    // likeRepository.save(newLike);
    // return true;
    // }

    @Transactional
    public boolean toggleReaction(Long userId, Long activityId, Long taskId, LikeType type) {
        if (activityId == null && taskId == null) {
            throw new IllegalArgumentException("activityId 또는 taskId 중 하나는 반드시 제공되어야 합니다.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // 🔹 사용자의 기존 리액션 찾기 (타입 관계없이)
        Optional<Like> existingLike;
        if (activityId != null) {
            existingLike = likeRepository.findByUserAndActivity(user,
                    activityLogRepository.findById(activityId).orElseThrow());
        } else {
            existingLike = likeRepository.findByUserAndTask(user, taskRepository.findById(taskId).orElseThrow());
        }

        // 🔹 기존 리액션이 있으면 삭제
        if (existingLike.isPresent()) {
            Like existing = existingLike.get();
            if (existing.getType().equals(type)) {
                // ✅ 같은 리액션이면 삭제 (즉, 취소)
                likeRepository.delete(existing);
                return false;
            } else {
                // ✅ 다른 리액션이면 기존 리액션 삭제 후 새로운 리액션 추가
                likeRepository.delete(existing);
            }
        }

        // 🔹 새로운 리액션 추가
        Like newLike = new Like();
        newLike.setUser(user);
        newLike.setType(type);

        if (activityId != null) {
            newLike.setActivity(activityLogRepository.findById(activityId).orElseThrow());
        } else {
            newLike.setTask(taskRepository.findById(taskId).orElseThrow());
        }

        likeRepository.save(newLike);
        return true;
    }

    public Map<String, Integer> getReactionCounts(Long activityId, Long taskId) {
        if (activityId != null) {
            return likeRepository.getReactionCountsByActivity(activityId);
        } else if (taskId != null) {
            return likeRepository.getReactionCountsByTask(taskId).stream()
                    .collect(Collectors.toMap(
                            obj -> obj[0].toString(), // ✅ LikeType을 String으로 변환
                            obj -> ((Number) obj[1]).intValue(),
                            (existing, replacement) -> existing // 중복 키 발생 시 기존 값 유지
                    ));
        }
        return Map.of(); // ✅ activityId와 taskId가 모두 null이면 빈 Map 반환
    }

}
