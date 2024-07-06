<?php

use App\Services\Router;
use Slim\Factory\AppFactory;

require_once __DIR__ . '/../vendor/autoload.php';

$app = AppFactory::create();
$app->addRoutingMiddleware();

function dd($data)
{
  echo '<pre>';
  var_dump($data);
  echo '</pre>';
  die();
}

require_once __DIR__ . '/../App/routes.php';

Router::register($app);

$app->run();