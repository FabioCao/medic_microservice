
// Create the namespace instance
let ns = {};

// Create the model instance
ns.model = (function() {
    'use strict';

    let $event_pump = $('body');

    // Return the API
    return {
        'read': function() {
            let ajax_options = {
                type: 'GET',
                url: 'api/medicamentos',
                accepts: 'application/json',
                dataType: 'json'
            };
            $.ajax(ajax_options)
            .done(function(data) {
                $event_pump.trigger('model_read_success', [data]);
            })
            .fail(function(xhr, textStatus, errorThrown) {
                $event_pump.trigger('model_error', [xhr, textStatus, errorThrown]);
            })
        },
        create: function(medicamento, fabricante, generico, dosagem, relacao) {
            let ajax_options = {
                type: 'POST',
                url: 'api/medicamentos',
                accepts: 'application/json',
                contentType: 'application/json',
                //dataType: 'json',
                data: JSON.stringify({
                    'medicamento': medicamento,
                    'fabricante': fabricante,
					'generico': generico,
					'dosagem': dosagem,
					'relacao': relacao				
                })
            };
            $.ajax(ajax_options)
            .done(function(data) {
                $event_pump.trigger('model_create_success', [data]);
            })
            .fail(function(xhr, textStatus, errorThrown) {
                $event_pump.trigger('model_error', [xhr, textStatus, errorThrown]);
            })
        },
        update: function(medicamento, fabricante, generico, dosagem, relacao) {
            let ajax_options = {
                type: 'PUT',
                url: 'api/medicamentos/' + medicamento,
                accepts: 'application/json',
                contentType: 'application/json',
                dataType: 'json',
                data: JSON.stringify({
                    'medicamento': medicamento,
                    'fabricante': fabricante,
					'generico': generico,
					'dosagem': dosagem,
					'relacao': relacao		
                })
            };
            $.ajax(ajax_options)
            .done(function(data) {
                $event_pump.trigger('model_update_success', [data]);
            })
            .fail(function(xhr, textStatus, errorThrown) {
                $event_pump.trigger('model_error', [xhr, textStatus, errorThrown]);
            })
        },
        'delete': function(medicamento) {
            let ajax_options = {
                type: 'DELETE',
                url: 'api/medicamentos/' + medicamento,
                accepts: 'application/json',
                contentType: 'plain/text'
            };
            $.ajax(ajax_options)
            .done(function(data) {
                $event_pump.trigger('model_delete_success', [data]);
            })
            .fail(function(xhr, textStatus, errorThrown) {
                $event_pump.trigger('model_error', [xhr, textStatus, errorThrown]);
            })
        }
    };
}());

// Create the view instance
ns.view = (function() {
    'use strict';

    let $medicamento = $('#medicamento'),
        $fabricante = $('#fabricante'),
		$generico = $('#generico'),
		$dosagem = $('#dosagem'),
		$relacao = $('#relacao');

    // return the API
    return {
        reset: function() {
            $medicamento.val('').focus();
			$fabricante.val('');
			$generico.val('');
		    $dosagem.val('');
		    $relacao.val('');	
        },
        update_editor: function(medicamento, fabricante, generico, dosagem, relacao) {
			$medicamento.val(medicamento).focus();
            $fabricante.val(fabricante);
            $generico.val(generico);
		    $dosagem.val(dosagem);
		    $relacao.val(relacao);
        },
        build_table: function(insulin) {
            let rows = ''

            // clear the table
            $('.conteudo table > tbody').empty();

            // did we get a insulin array?
            if (insulin) {
                for (let i=0, l=insulin.length; i < l; i++) {
                    rows += `<tr><td class="medicamento">${insulin[i].medicamento}</td><td class="fabricante">${insulin[i].fabricante}</td><td class="generico">${insulin[i].generico}</td><td class="dosagem">${insulin[i].dosagem}</td><td class="relacao">${insulin[i].relacao}</td><td>${insulin[i].timestamp}</td></tr>`;
                }
                $('table > tbody').append(rows);
            }
        },
        error: function(error_msg) {
            $('.error')
                .text(error_msg)
                .css('visibility', 'visible');
            setTimeout(function() {
                $('.error').css('visibility', 'hidden');
            }, 3000)
        }
    };
}());

// Create the controller
ns.controller = (function(m, v) {
    'use strict';

    let model = m,
        view = v,
        $event_pump = $('body'),
        $medicamento = $('#medicamento'),
        $fabricante = $('#fabricante'),
		$generico = $('#generico'),
		$dosagem = $('#dosagem'),
		$relacao = $('#relacao');	

    // Get the data from the model after the controller is done initializing
    setTimeout(function() {
        model.read();
    }, 100)

    // Validate input
    function validate(medicamento, fabricante, generico, dosagem, relacao) {
        return medicamento !== "" && fabricante !== "" && generico !== "" && relacao !== "";
    }

    // Create our event handlers
    $('#create').click(function(e) {
        let medicamento = $medicamento.val(),
            fabricante = $fabricante.val(),
			generico = $generico.val(),
			dosagem = $dosagem.val(),
			relacao = $relacao.val();	

        e.preventDefault();

        if (validate(medicamento, fabricante, generico, dosagem, relacao)) {
            model.create(medicamento, fabricante, generico, dosagem, relacao)
        } else {
            alert('Problema com os parâmetros: valores não informados');
        }
    });

    $('#update').click(function(e) {
        let medicamento = $medicamento.val(),
            fabricante = $fabricante.val(),
			generico = $generico.val(),
			dosagem = $dosagem.val(),
			relacao = $relacao.val();
			
        e.preventDefault();

        if (validate(medicamento, fabricante, generico, dosagem, relacao)) {
            model.update(medicamento, fabricante, generico, dosagem, relacao)
        } else {
            alert('Problema com os parâmetros: valores não informados');
        }
        e.preventDefault();
    });

    $('#delete').click(function(e) {
        let medicamento = $medicamento.val();

        e.preventDefault();

        if (validate('placeholder', medicamento)) {
            model.delete(medicamento)
        } else {
            alert('Problema com os parâmetros: medicamento');
        }
        e.preventDefault();
    });

    $('#reset').click(function() {
        //location.reload();
        //model.read();
        window.location.reload();
        view.reset();
    })

    $('table > tbody').on('dblclick', 'tr', function(e) {
        let $target = $(e.target),
            medicamento,
            fabricante,
			generico,
			dosagem,
			relacao;

        medicamento = $target
            .parent()
            .find('td.medicamento')
            .text();
		
		fabricante = $target
            .parent()
            .find('td.fabricante')
            .text();

        generico = $target
            .parent()
            .find('td.generico')
            .text();
		
		dosagem = $target
            .parent()
            .find('td.dosagem')
            .text();
			
		relacao = $target
            .parent()
            .find('td.relacao')
            .text();
		
        view.update_editor(medicamento, fabricante, generico, dosagem, relacao);
    });

    // Handle the model events
    $event_pump.on('model_read_success', function(e, data) {
        view.build_table(data);
        view.reset();
    });

    $event_pump.on('model_create_success', function(e, data) {
        model.read();
    });

    $event_pump.on('model_update_success', function(e, data) {
        model.read();
    });

    $event_pump.on('model_delete_success', function(e, data) {
        model.read();
    });


    $event_pump.on('model_error', function(e, xhr, textStatus, errorThrown) {
        let error_msg = "Msg de Erro:" + textStatus + ': ' + errorThrown + ' - ' + xhr.responseJSON.detail;
        view.error(error_msg);
        console.log(error_msg);
    })
}(ns.model, ns.view));