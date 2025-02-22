/* 데이터베이스와의 상호작용 담당, 특정 조건의 데이터를 조회할 수 있음음 */

package org.zerock.teamverse.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.zerock.teamverse.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username); // 사용자 이름으로 검색
    Optional<User> findByEmail(String email); // 이메일로 검색
    Optional<User> findById(Long id); // ✅ 사용자 ID로 검색
}
