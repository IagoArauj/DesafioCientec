<?php

namespace App\Services;

final class Database
{
  private static $instance = null;
  private static  $connection = null;

  private function __construct()
  {
    self::$connection = new \PDO($_ENV['DB_URL'], $_ENV['DB_USER'], $_ENV['DB_PASS']);
    self::$connection->setAttribute(\PDO::ATTR_DEFAULT_FETCH_MODE, \PDO::FETCH_ASSOC);
  }

  public static function getInstance()
  {
    if (self::$instance === null) {
      self::$instance = new self();
    }

    return self::$instance;
  }

  public function getConnection()
  {
    return self::$connection;
  }
}
