package org.zerock.teamverse.util;

import java.io.File;
import java.io.FileOutputStream;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;

public class EmojiStorageUtil {

    public static String saveBase64Image(String base64Image) {
        try {
            // Base64 데이터에서 헤더 제거
            String base64Data = base64Image.split(",")[1];

            // SHA-256 해시 생성 (중복 저장 방지)
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(base64Data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hashString = new StringBuilder();
            for (byte b : hashBytes) {
                hashString.append(String.format("%02x", b));
            }
            String fileName = hashString.toString() + ".png";

            // 저장할 디렉토리 설정
            String uploadDir = "storage/uploads";
            File dir = new File(uploadDir);
            if (!dir.exists()) {
                dir.mkdirs(); // 디렉토리 없으면 생성
            }

            // 이미 동일한 파일이 존재하는지 확인
            File imageFile = new File(uploadDir, fileName);
            if (imageFile.exists()) {
                System.out.println("이미 저장된 이모티콘: " + fileName);
                return "/uploads/" + fileName; // 기존 파일 URL 반환
            }

            // 바이트 배열로 변환 후 저장
            byte[] imageBytes = Base64.getDecoder().decode(base64Data);
            try (FileOutputStream fos = new FileOutputStream(imageFile)) {
                fos.write(imageBytes);
            }

            System.out.println("새로운 이모티콘 저장: " + fileName);
            return "/uploads/" + fileName; // 저장된 파일 URL 반환
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}
