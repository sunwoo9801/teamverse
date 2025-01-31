// package org.zerock.teamverse.dto;

// public class LoginResponse {

//     private String token; // JWT 토큰

//     // 생성자
//     public LoginResponse(String token) {
//         this.token = token;
//     }

//     // Getter
//     public String getToken() {
//         return token;
//     }

//     public void setToken(String token) {
//         this.token = token;
//     }
// }

package org.zerock.teamverse.dto;

public class LoginResponse {

    private String accessToken; // Access Token
    private String refreshToken; // Refresh Token

    // 생성자
    public LoginResponse(String accessToken, String refreshToken) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
    }

    // Getter
    public String getAccessToken() {
        return accessToken;
    }

    public String getRefreshToken() {
        return refreshToken;
    }
}
