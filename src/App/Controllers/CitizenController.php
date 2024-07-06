<?php

namespace App\Controllers;

use App\Models\Citizen;
use App\Renderer\JsonRenderer;
use App\Services\Database;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

final class CitizenController
{
  public static function index(Request $request, Response $response, array $args)
  {
    $qp = $request->getQueryParams();
    $citizens = Citizen::all($qp['limit'] ?? 10, $qp['offset'] ?? 0);
    return JsonRenderer::render($response, $citizens);
  }

  public static function store(Request $request, Response $response, $args)
  {
    if (!isset($request->getParsedBody()['name']) || empty($request->getParsedBody()['name'])) {
      return JsonRenderer::render($response, ['message' => 'O nome é obrigatório.'], 400);
    }
    $id = Citizen::createId();
    Citizen::save($id, $request->getParsedBody()['name']);
    return JsonRenderer::render(
      $response,
      ['message' => "Cidadão " . $request->getParsedBody()['name'] . " criado.", 'id' => $id],
      201
    );
  }

  public static function update(Request $request, Response $response, $args)
  {
    $body = json_decode($request->getBody()->getContents(), true);
    
    if (!isset($body['name']) || empty($body['name'])) {
      return JsonRenderer::render($response, ['message' => 'O nome é obrigatório.'], 400);
    }

    if (!$args['id'] || empty($args['id']) || strlen($args['id']) !== 11) {
      return JsonRenderer::render($response, ['message' => 'O NIS é obrigatório ou está inválido.'], 400);
    }

    $citizen = Citizen::find($args['id']);
    if (!$citizen) {
      return JsonRenderer::render($response, ['message' => 'Não foi encontrado nenhum cidadão com este NIS.'], 404);
    }

    Citizen::update($args['id'], $body['name']);
    return JsonRenderer::render($response, ['message' => 'Cidadão atualizado.']);
  }

  public static function destroy(Request $request, Response $response, $args)
  {
    $citizen = Citizen::find($args['id']);
    if (!$citizen) {
      return JsonRenderer::render($response, ['message' => 'Não foi encontrado nenhum cidadão com este NIS.'], 404);
    }

    $db = Database::getInstance()->getConnection();
    $stmt = $db->prepare('UPDATE citizens SET status = 0 WHERE id = :id');
    $stmt->execute(['id' => $args['id']]);
    return JsonRenderer::render($response, ['message' => 'Cidadão excluído.']);
  }

  public static function find(Request $request, Response $response, $args)
  {
    $citizen = Citizen::find($args['id']);
    if (!$citizen) {
      return JsonRenderer::render($response, ['message' => 'Não foi encontrado nenhum cidadão com este NIS.'], 404);
    }

    return JsonRenderer::render($response, $citizen);
  }
}
