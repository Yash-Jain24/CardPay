package com.cardpay.core.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;

import javax.sql.DataSource;
import java.net.URI;
import java.net.URISyntaxException;

@Configuration
@Profile("prod")
public class ProductionDataSourceConfig {

    @Bean
    @Primary
    @ConfigurationProperties("spring.datasource") // Allows overriding other properties if needed
    public DataSource dataSource() throws URISyntaxException {
        // Read the "DATABASE_URL" environment variable provided by Render or similar
        // platforms
        String dbUrl = System.getenv("DATABASE_URL");
        if (dbUrl == null || dbUrl.isEmpty()) {
            // Fallback for when DATABASE_URL is not set (will fail downstream or use
            // defaults if any)
            return new HikariDataSource();
        }

        // Parse the URL
        String cleanUrl = dbUrl;
        if (cleanUrl.startsWith("jdbc:")) {
            cleanUrl = cleanUrl.substring(5);
        }
        URI dbUri = new URI(cleanUrl);

        // Extract credentials
        String username = "";
        String password = "";

        if (dbUri.getUserInfo() != null) {
            String[] userInfo = dbUri.getUserInfo().split(":");
            username = userInfo[0];
            password = userInfo.length > 1 ? userInfo[1] : "";
        }

        // Build the clean JDBC URL
        // JDBC expects "jdbc:postgresql://host:port/path"

        int port = dbUri.getPort() == -1 ? 5432 : dbUri.getPort();

        // Handle "postgres://" schema mapping (or "postgresql://") to
        // "jdbc:postgresql://"
        String jdbcUrl = "jdbc:postgresql://" + dbUri.getHost() + ":" + port + dbUri.getPath();

        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(jdbcUrl);
        config.setUsername(username);
        config.setPassword(password);

        // Optimization for production
        config.setMaximumPoolSize(10);
        config.setMinimumIdle(2);

        return new HikariDataSource(config);
    }
}
