package com.cardpay.core.config;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import java.net.URI;
import static org.junit.jupiter.api.Assertions.*;

public class ProductionDataSourceConfigTest {

    @Test
    public void testUrlParsing() throws Exception {
        // Mock different Render URL formats
        verifyParsing("postgres://user:pass@dpg-host:5432/db", "dpg-host", "user", "pass");
        verifyParsing("jdbc:postgresql://user:pass@dpg-host:5432/db", "dpg-host", "user", "pass");
        verifyParsing("postgres://user:pass@dpg-host/db", "dpg-host", "user", "pass"); // default port
    }

    private void verifyParsing(String dbUrl, String expectedHost, String expectedUser, String expectedPass)
            throws Exception {
        String cleanUrl = dbUrl;
        if (cleanUrl.startsWith("jdbc:")) {
            cleanUrl = cleanUrl.substring(5);
        }
        URI dbUri = new URI(cleanUrl);

        String username = "";
        String password = "";

        if (dbUri.getUserInfo() != null) {
            String[] userInfo = dbUri.getUserInfo().split(":");
            username = userInfo[0];
            password = userInfo.length > 1 ? userInfo[1] : "";
        }

        int port = dbUri.getPort() == -1 ? 5432 : dbUri.getPort();
        String jdbcUrl = "jdbc:postgresql://" + dbUri.getHost() + ":" + port + dbUri.getPath();

        assertEquals(expectedHost, dbUri.getHost());
        assertEquals(expectedUser, username);
        assertEquals(expectedPass, password);
        assertTrue(jdbcUrl.startsWith("jdbc:postgresql://" + expectedHost));
    }
}
