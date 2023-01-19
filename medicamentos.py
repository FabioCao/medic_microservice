from datetime import datetime
from flask import jsonify, make_response, abort

from pymongo import MongoClient

#client = MongoClient("mongodb://localhost:27017/") # Local
client = MongoClient("mongodb://mongo3:27017")
db = client.medicamentos

def get_dict_from_mongodb():
    itens_db = db.medicamentos.find()
    INSULIN = {}
    for i in itens_db:
            i.pop('_id') # retira id: criado automaticamente docker 
            item = dict(i)
            INSULIN[item["medicamento"]] = (i)
    return INSULIN

def get_timestamp():
    return datetime.now().strftime(("%Y-%m-%d %H:%M:%S"))

def read_all():
    INSULIN = get_dict_from_mongodb()
    dict_medicamentos = [INSULIN[key] for key in sorted(INSULIN.keys())]
    medicamentos = jsonify(dict_medicamentos)
    qtd = len(dict_medicamentos)
    content_range = "medicamentos 0-"+str(qtd)+"/"+str(qtd)
    # Configura headers
    medicamentos.headers['Access-Control-Allow-Origin'] = '*'
    medicamentos.headers['Access-Control-Expose-Headers'] = 'Content-Range'
    medicamentos.headers['Content-Range'] = content_range
    return medicamentos

def read_one(medicamento):
    MEDIC = get_dict_from_mongodb()
    if medicamento in MEDIC:
        medic = MEDIC.get(medicamento)
    else:
        abort(
            404, "medicamento {medicamento} nao encontrado".format(medicamento=medicamento)
        )
    return medic

def create(medic):
    medicamento = medic.get("medicamento", None)
    fabricante = medic.get("fabricante", None)
    generico = medic.get("generico", None)
    dosagem = medic.get("dosagem", None)
    relacao = medic.get("relacao", None)	
    INSULIN = get_dict_from_mongodb()
    if medicamento not in INSULIN and medicamento is not None:
        item = {
            "medicamento": medicamento,
            "fabricante": fabricante,
			"generico": generico,
			"dosagem": dosagem,
			"relacao": relacao,
            "timestamp": get_timestamp(),
        }
        db.medicamentos.insert_one(item)
        return make_response(
            "medicamento {medicamento} criada com sucesso".format(medicamento=medicamento), 201
        )
    else:
        abort(
            406,
            "medicamento ja existe".format(medicamento=medicamento),
        )

def update(medicamento, insulin):
    query = { "medicamento": medicamento }
    update = { "$set": {
            "medicamento": medicamento,
            "fabricante": insulin.get("fabricante"),
			"generico": insulin.get("generico"),
			"dosagem": insulin.get("dosagem"),
			"relacao": insulin.get("relacao"),
            "timestamp": get_timestamp(), } 
        }
    INSULIN = get_dict_from_mongodb()

    if medicamento in INSULIN:
        db.medicamentos.update_one(query, update)
        INSULIN = get_dict_from_mongodb()
        return INSULIN[medicamento]
    else:
        abort(
            404, "medicamento {medicamento} nao encontrada".format(medicamento=medicamento)
        )

def delete(medicamento):
    query = { "medicamento": medicamento }
    INSULIN = get_dict_from_mongodb()
    if medicamento in INSULIN:
        db.medicamentos.delete_one(query)
        return make_response(
            "medicamento {medicamento} deletada com sucesso".format(medicamento=medicamento), 200
        )
    else:
        abort(
            404, "Insilina {medicamento} nao encontrada".format(medicamento=medicamento)
        )

