<?php

use App\Services\Router;

Router::get('/', function ($request, $response) {
  require_once __DIR__ . '/../public/home.html';
  return $response->withStatus(200);
});

Router::get('/api/citizen', '\App\Controllers\CitizenController::index');
Router::post('/api/citizen', '\App\Controllers\CitizenController::store');
Router::put('/api/citizen/{id}', '\App\Controllers\CitizenController::update');
Router::delete('/api/citizen/{id}', '\App\Controllers\CitizenController::destroy');
Router::get('/api/citizen/{id}', '\App\Controllers\CitizenController::find');