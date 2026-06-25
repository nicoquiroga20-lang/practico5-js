from fastapi import APIRouter, Path, Query, HTTPException
from typing import Annotated
from src.schemas.articulos import ArticuloSchema, ArticuloUpdateSchema

router = APIRouter()

not_found = {
    404: { 
        "description": "Artículo no encontrado en el sistema",
        "content": {
            "application/json": {
                "example": {
                    "detail": "Artículo no encontrado"
                }
            }
        },
    },
}

articulos = [
    {'id': 1, 'nombre_articulo': 'Mouse Hyperx', 'precio': 80000, 'activo': True},
    {'id': 2, 'nombre_articulo': 'Teclado Razer', 'precio': 120000, 'activo': True},
    {'id': 3, 'nombre_articulo': 'Mouse Redragon', 'precio': 8000, 'activo': True},
    {'id': 4, 'nombre_articulo': 'Mouse Logitech', 'precio': 180000, 'activo': True},
    {'id': 5, 'nombre_articulo': 'Auriculares Logitech', 'precio': 510000, 'activo': True},
    {'id': 6, 'nombre_articulo': 'Auriculares Hyper X', 'precio': 260000, 'activo': True},
    {'id': 7, 'nombre_articulo': 'Teclado Hyper X', 'precio': 168000, 'activo': True},
    {'id': 8, 'nombre_articulo': 'Teclado Redragon', 'precio': 85000, 'activo': True}
]

@router.get('', response_model=list[ArticuloSchema])
async def get_articulos():
    return articulos

@router.get('/{id}', responses=not_found, response_model=ArticuloSchema)
async def get_articulo_by_id(
    id: Annotated[int, Path(gt=0, description='ID del articulo que deseas buscar')] 
):
    for articulo in articulos:
        if articulo['id'] == id:
            return articulo
    raise HTTPException(status_code=404, detail='Articulo no encontrado')

@router.post('', response_model=list[ArticuloSchema])
async def post_articulo(articulo_nuevo: ArticuloSchema):
    articulos.append(articulo_nuevo.model_dump()) 
    return articulos

@router.delete('/{id}', responses=not_found, response_model=list[ArticuloSchema])
async def delete_articulo_by_id(
    id: Annotated[int, Path(gt=0, description='ID del articulo a eliminar')],
    logico: Annotated[bool, Query(description='Mantener articulo? (True = SI / False = NO)')] = False
) -> list[ArticuloSchema]:
    for articulo in articulos:
        if articulo['id'] == id:
            if logico:
                articulo['activo'] = False
            else:
                articulos.remove(articulo)
            return articulos
    raise HTTPException(status_code=404, detail='Articulo no encontrado')

@router.put('/{id}', responses=not_found, response_model=ArticuloSchema)
async def put_articulo_by_id(
    id: Annotated[int, Path(gt=0, description='ID del articulo a modificar')],
    articulo_actualizado: ArticuloUpdateSchema
):
    for articulo in articulos:
        if articulo['id'] == id:
            articulo['nombre_articulo'] = articulo_actualizado.nombre_articulo
            articulo['precio'] = articulo_actualizado.precio
            return articulo
    raise HTTPException(status_code=404, detail='Articulo no encontrado')