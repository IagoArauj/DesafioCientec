<?php

namespace App\Models;

use App\Services\Database;

final class Citizen
{

  public static function createId(): string
  {
    $id = Database::getInstance()->getConnection()->query(
      'SELECT NUM
          FROM (SELECT round(RAND()*99999999999) AS `NUM`) x 
          WHERE `NUM` NOT IN (SELECT `id` FROM `citizens`)'
    )->fetchColumn();

    return str_pad($id, 11, '0', STR_PAD_LEFT);
  }

  public static function save(string $id, string $name)
  {
    $db = Database::getInstance()->getConnection();
    $stmt = $db->prepare('INSERT INTO citizens (id, name) VALUES (:id, :name)');
    $stmt->execute(['id' => $id, 'name' => $name]);
  }

  public static function all(int $limit = 10, int $offset = 0): array
  {
    $db = Database::getInstance()->getConnection();
    $stmt = $db->query(
      'SELECT *
        FROM citizens
      WHERE status = 1
      LIMIT ' . $limit . ' OFFSET ' . $offset
    );
    $citizens = $stmt->fetchAll();
    return $citizens;
  }

  public static function find(string $id): array
  {
    $db = Database::getInstance()->getConnection();
    $stmt = $db->prepare(
      'SELECT *
        FROM citizens
      WHERE id = :id AND
        status = 1'
    );
    $stmt->execute(['id' => $id]);
    $citizen = $stmt->fetch() ?: [];
    return $citizen;
  }

  public static function update(string $id, string $name)
  {
    $db = Database::getInstance()->getConnection();
    $stmt = $db->prepare('UPDATE citizens SET name = :name WHERE id = :id');
    $stmt->execute(['id' => $id, 'name' => $name]);
  }

  public function delete(string $id)
  {
    $db = Database::getInstance()->getConnection();
    $stmt = $db->prepare('UPDATE citizens SET status = 0 WHERE id = :id');
    $stmt->execute(['id' => $id]);
  }
}
