<?php

namespace App\Services;

use Slim\App;

final class Router
{
  private static array $routes = [];

  public static function get($path, $callback)
  {
    self::$routes[] = [
      'path' => $path,
      'callback' => $callback,
      'method' => 'get'
    ];

  }

  public static function post($path, $callback)
  {
    self::$routes[] = [
      'path' => $path,
      'callback' => $callback,
      'method' => 'post'
    ];
  }

  public static function put($path, $callback)
  {
    self::$routes[] = [
      'path' => $path,
      'callback' => $callback,
      'method' => 'put'
    ];
  }

  public static function delete($path, $callback)
  {
    self::$routes[] = [
      'path' => $path,
      'callback' => $callback,
      'method' => 'delete'
    ];
  }

  public static function register(App $app)
  {
    if (empty(self::$routes)) {
      echo 'No routes to register.' . PHP_EOL;
      return;
    }

    foreach (self::$routes as $route) {
      $app->{$route['method']}($route['path'], $route['callback']);
    }
  }

}