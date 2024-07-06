FROM php:8.3.8-apache

# Install composer
COPY --from=composer:latest /usr/bin/composer /usr/local/bin/composer

# Install dependencies
RUN apt-get update && apt-get install -y git \
    && docker-php-ext-install pdo_mysql \
    && a2enmod rewrite
