package com.team.util;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import java.util.Date;

public class JwtUtil {
    private static final String SECRET = "mySecretKeyForTeamMatch2026";
    private static final long EXPIRE_MS = 7 * 24 * 3600 * 1000L;

    public static String generateToken(Long userId) {
        Date now = new Date();
        Date expire = new Date(now.getTime() + EXPIRE_MS);
        return JWT.create()
                .withSubject(String.valueOf(userId))
                .withIssuedAt(now)
                .withExpiresAt(expire)
                .sign(Algorithm.HMAC256(SECRET));
    }

    public static Long getUserIdFromToken(String token) {
        try {
            DecodedJWT jwt = JWT.require(Algorithm.HMAC256(SECRET)).build().verify(token);
            return Long.parseLong(jwt.getSubject());
        } catch (Exception e) {
            return null;
        }
    }
}
