<?php

namespace App\Renderer;

use Psr\Http\Message\ResponseInterface as Response;

final class JsonRenderer
{
  public static function render(Response $response, $data, $status = 200)
  {
    $response->getBody()->write(json_encode($data), JSON_UNESCAPED_SLASHES);
    return $response->withHeader('Content-Type', 'application/json')->withStatus($status);
  }
}