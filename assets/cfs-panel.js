/* SPDX-License-Identifier: GPL-3.0-only
 * CFSail, localized from Noyeah CFS Panel v20261013-8.
 * Original modifications by Noyeah, 2026-10-13.
 * Based on swilsonnc/K2-plus-cfs-panel: dashboard mounting and CFS WebSocket flow.
 * https://github.com/swilsonnc/K2-plus-cfs-panel
 * Protocol cross-checked against CrealityOfficial/CrealityPrint's SetMaterials.
 */
(function (root) {
  'use strict';
  // Bundled at build time: no network request or runtime dependency.
  const catalogs = {"en":{"action.cancel":"Cancel","action.close":"Close","action.edit":"Edit type and color","action.load":"Load","action.save":"Save","action.unload":"Unload","aria.cfs":"CFS {id}","aria.color":"Choose color","aria.external.tab":"Select Ext.","aria.lcd":"CFS {id}, temperature {temperature}°C, humidity {humidity}% RH","aria.palette":"Choose {color}","aria.panel":"CFSail · CFS filament management","aria.photo":"Creality CFS","aria.refresh":"Refresh CFS information","aria.slot.actions":"Choose filament action for {slot} · {status}","aria.slot.detail":"Choose action for {slot}, {type} · {status}","aria.sources":"Choose filament source","aria.spool":"External spool · {color}","color.unset":"Color not set","connection.checking":"Checking status","connection.connecting":"Connecting","connection.delayed":"Response delayed","connection.nocfs":"CFS disconnected","connection.noinfo":"No information","connection.online":"Connected","connection.synced":"Synchronized","editor.color":"Color","editor.current":"Current printer values: {type} · {color}","editor.current.loaded":"Current printer values: {type} · {color} · Loaded into extruder","editor.disconnected":"Disconnected before the save was confirmed.","editor.pending":"Waiting for save confirmation for {slot}…","editor.preset":"Will be saved as {preset}.","editor.saved":"Filament information saved.","editor.timeout":"The save could not be confirmed. Please refresh the slot information.","editor.title":"Edit filament {slot}","editor.type":"Filament type","error.code.unknown":"Unknown code","error.color":"Please choose a valid color.","error.edit.locked":"This slot cannot be edited right now.","error.material":"Printer material information is unavailable. Please refresh.","error.printer.detail":"Printer error {code} · {detail}","error.printer.screen":"Printer error {code} · Please check the printer screen for details.","error.slot.changed":"This slot's status has changed. Please check again.","error.state.changed":"The printer or slot status has changed. Please refresh and check again.","error.transport":"This action is unavailable for this slot.","external.info":"External spool information reported by the printer","external.missing":"The printer has not reported external spool information.","external.refresh":"External spool information is unavailable. Please refresh.","external.short":"Ext.","external.title":"Ext.","language.auto":"Follow Mainsail","language.label":"Language","material.configure":"Please set the filament type and color.","material.unset":"Not set","menu.note":"Load and Unload start nozzle heating and filament movement on the printer. Filament can only be unloaded from a slot if it is loaded into the extruder.","menu.status":"Checking current printer status…","menu.telemetry":"{activity} · {nozzle}","menu.title":"Filament {slot}","nozzle.off":"Nozzle {value}°C · Heating off","nozzle.target.unknown":"Nozzle {value}°C · Checking target","nozzle.unknown":"Checking nozzle temperature","nozzle.value":"Nozzle {value} / {target}°C","reason.busy":"A filament operation is in progress. Please wait until it finishes.","reason.cfs":"Please check the CFS connection.","reason.configure":"Please set the filament type and color first.","reason.disconnected":"Printer disconnected. Please wait for reconnection.","reason.empty":"This slot is empty. Please insert filament.","reason.error":"Please check the printer error on the printer screen.","reason.external":"External spool information is unavailable.","reason.external.transport":"Please load or unload the external spool using the printer touchscreen.","reason.loaded":"The filament from this slot is already loaded into the extruder.","reason.locked":"The printer reports this filament as read-only.","reason.materials":"Loading the printer's material list.","reason.notloaded":"The filament from this slot is not loaded into the extruder.","reason.pending":"Waiting for the previous request to be confirmed.","reason.printing":"Actions are unavailable while printing.","reason.readonly":"Actions are unavailable in read-only mode.","reason.slot.busy":"A filament operation is in progress for this slot.","reason.stale":"Printer response is delayed. Please refresh and check again.","reason.status":"Checking printer status.","reason.temperature":"Please check the filament status and temperature range.","reason.unsupported":"This action is not supported.","slot.configure":"Setup required","slot.empty":"Empty slot","slot.loaded":"Filament loaded into extruder","slot.loaded.badge":"● Loaded into extruder","slot.loaded.summary":"{name} · Loaded into extruder","slot.loading":"Loading","slot.manual":"Manual settings","slot.rfid":"RFID","slot.unconfigured":"Filament not configured","slot.unloading":"Unloading","stage.cut":"Cutting filament","stage.extrude":"Extruding filament","stage.feed":"Feeding filament into extruder","stage.idle":"Filament idle","stage.load.done":"Loading complete","stage.load.heat":"Loading · Heating nozzle","stage.new.move":"Moving new filament","stage.old.retract":"Retracting previous filament","stage.other":"Filament operation in progress · State {code}","stage.position":"Checking filament position","stage.purge":"Purging previous filament","stage.retract":"Retracting filament","stage.target":"{slot} · {stage}","stage.unknown":"Checking filament status","stage.unload.done":"Unloading complete","stage.unload.heat":"Unloading · Heating nozzle","stage.unload.prepare":"Preparing to unload","status.checking":"Checking printer status…","status.delayed":"Printer response delayed · Current status unavailable.","status.printing":"Printing · {activity}","status.readonly":"Read-only · Select a slot to view its status.","status.reconnecting":"Printer disconnected. Reconnecting…","transport.cfs.lost":"CFS disconnected before the result was confirmed. Please check the printer screen.","transport.disconnected":"Disconnected before the operation was confirmed. Please check the printer screen.","transport.load.done":"{slot} loading complete · Loaded into extruder","transport.load.sent":"Load request sent for {slot} · Waiting for printer confirmation…","transport.timeout":"The operation could not be confirmed. Please check the printer screen and filament.","transport.unload.done":"{slot} unloading complete","transport.unload.sent":"Unload request sent for {slot} · Waiting for printer confirmation…"},"es":{"action.cancel":"Cancelar","action.close":"Cerrar","action.edit":"Editar tipo y color","action.load":"Cargar","action.save":"Guardar","action.unload":"Descargar","aria.cfs":"CFS {id}","aria.color":"Seleccione un color","aria.external.tab":"Seleccionar Ext.","aria.lcd":"CFS {id}, temperatura {temperature}°C, humedad relativa {humidity}%","aria.palette":"Seleccione {color}","aria.panel":"CFSail · Gestión de filamento CFS","aria.photo":"Creality CFS","aria.refresh":"Actualice la información del CFS","aria.slot.actions":"Seleccione una acción de filamento para {slot} · {status}","aria.slot.detail":"Seleccione una acción para {slot}, {type} · {status}","aria.sources":"Seleccione el origen del filamento","aria.spool":"Bobina externa · {color}","color.unset":"Color sin configurar","connection.checking":"Consultando el estado","connection.connecting":"Conectando","connection.delayed":"Respuesta demorada","connection.nocfs":"CFS desconectado","connection.noinfo":"Sin información","connection.online":"Conectado","connection.synced":"Sincronizado","editor.color":"Color","editor.current":"Valores actuales de la impresora: {type} · {color}","editor.current.loaded":"Valores actuales de la impresora: {type} · {color} · Cargado en el extrusor","editor.disconnected":"La conexión se interrumpió antes de confirmar el guardado.","editor.pending":"Esperando la confirmación del guardado de {slot}…","editor.preset":"Se guardará como {preset}.","editor.saved":"Información del filamento guardada.","editor.timeout":"No se pudo confirmar el guardado. Actualice la información del compartimento.","editor.title":"Editar filamento {slot}","editor.type":"Tipo de filamento","error.code.unknown":"Código desconocido","error.color":"Seleccione un color válido.","error.edit.locked":"Este compartimento no se puede editar ahora.","error.material":"No se puede obtener la información del material. Actualice los datos.","error.printer.detail":"Error de la impresora {code} · {detail}","error.printer.screen":"Error de la impresora {code} · Consulte los detalles en la pantalla de la impresora.","error.slot.changed":"El estado del compartimento ha cambiado. Vuelva a comprobarlo.","error.state.changed":"El estado de la impresora o del compartimento ha cambiado. Actualice y vuelva a comprobar.","error.transport":"Esta acción no está disponible para este compartimento.","external.info":"Información de la bobina externa indicada por la impresora","external.missing":"La impresora no ha indicado información de la bobina externa.","external.refresh":"No se puede consultar la bobina externa. Actualice los datos.","external.short":"Ext.","external.title":"Ext.","language.auto":"Usar el idioma de Mainsail","language.label":"Idioma","material.configure":"Configure el tipo y el color del filamento.","material.unset":"Sin configurar","menu.note":"Cargar y Descargar inician el calentamiento de la boquilla y el movimiento del filamento en la impresora. Solo se puede descargar el filamento de un compartimento si ya está cargado en el extrusor.","menu.status":"Consultando el estado actual de la impresora…","menu.telemetry":"{activity} · {nozzle}","menu.title":"Filamento {slot}","nozzle.off":"Boquilla {value}°C · Calentamiento desactivado","nozzle.target.unknown":"Boquilla {value}°C · Consultando la temperatura objetivo","nozzle.unknown":"Consultando la temperatura de la boquilla","nozzle.value":"Boquilla {value} / {target}°C","reason.busy":"Hay una operación de filamento en curso. Espere a que termine.","reason.cfs":"Compruebe la conexión del CFS.","reason.configure":"Configure primero el tipo y el color del filamento.","reason.disconnected":"La impresora está desconectada. Espere a que se reconecte.","reason.empty":"Este compartimento está vacío. Introduzca filamento.","reason.error":"Consulte el error de la impresora en la pantalla de la impresora.","reason.external":"No se puede obtener la información de la bobina externa.","reason.external.transport":"Cargue o descargue la bobina externa desde la pantalla táctil de la impresora.","reason.loaded":"El filamento de este compartimento ya está cargado en el extrusor.","reason.locked":"La impresora indica que este filamento es de solo lectura.","reason.materials":"Obteniendo la lista de materiales de la impresora.","reason.notloaded":"El filamento de este compartimento no está cargado en el extrusor.","reason.pending":"Esperando la confirmación de la solicitud anterior.","reason.printing":"No se pueden realizar acciones durante la impresión.","reason.readonly":"No se pueden realizar acciones en modo de solo lectura.","reason.slot.busy":"Hay una operación de filamento en curso en este compartimento.","reason.stale":"La respuesta de la impresora tarda demasiado. Actualice y vuelva a comprobar.","reason.status":"Consultando el estado de la impresora.","reason.temperature":"Compruebe el estado del filamento y su intervalo de temperatura.","reason.unsupported":"Esta acción no es compatible.","slot.configure":"Configuración necesaria","slot.empty":"Compartimento vacío","slot.loaded":"Filamento cargado en el extrusor","slot.loaded.badge":"● Cargado en el extrusor","slot.loaded.summary":"{name} · Cargado en el extrusor","slot.loading":"Cargando","slot.manual":"Configuración manual","slot.rfid":"RFID","slot.unconfigured":"Filamento sin configurar","slot.unloading":"Descargando","stage.cut":"Cortando filamento","stage.extrude":"Extruyendo filamento","stage.feed":"Introduciendo filamento en el extrusor","stage.idle":"Filamento en espera","stage.load.done":"Carga completada","stage.load.heat":"Carga · Calentando la boquilla","stage.new.move":"Moviendo el nuevo filamento","stage.old.retract":"Retirando el filamento anterior","stage.other":"Operación de filamento en curso · Estado {code}","stage.position":"Comprobando la posición del filamento","stage.purge":"Purgando el filamento anterior","stage.retract":"Retirando filamento","stage.target":"{slot} · {stage}","stage.unknown":"Consultando el estado del filamento","stage.unload.done":"Descarga completada","stage.unload.heat":"Descarga · Calentando la boquilla","stage.unload.prepare":"Preparando la descarga","status.checking":"Consultando el estado de la impresora…","status.delayed":"Respuesta demorada · No se puede consultar el estado actual.","status.printing":"Imprimiendo · {activity}","status.readonly":"Solo lectura · Seleccione un compartimento para consultar su estado.","status.reconnecting":"La impresora se ha desconectado. Reconectando…","transport.cfs.lost":"El CFS se desconectó antes de confirmar el resultado. Consulte la pantalla de la impresora.","transport.disconnected":"La conexión se interrumpió antes de confirmar la operación. Consulte la pantalla de la impresora.","transport.load.done":"Carga de {slot} completada · Cargado en el extrusor","transport.load.sent":"Solicitud de carga enviada para {slot} · Esperando la confirmación de la impresora…","transport.timeout":"No se pudo confirmar la operación. Compruebe la pantalla de la impresora y el estado del filamento.","transport.unload.done":"Descarga de {slot} completada","transport.unload.sent":"Solicitud de descarga enviada para {slot} · Esperando la confirmación de la impresora…"},"ja":{"action.cancel":"キャンセル","action.close":"閉じる","action.edit":"種類と色を編集","action.load":"ロード","action.save":"保存","action.unload":"アンロード","aria.cfs":"CFS {id}","aria.color":"色を選択","aria.external.tab":"Ext. を選択","aria.lcd":"CFS {id}、温度 {temperature}°C、湿度 {humidity}% RH","aria.palette":"{color}を選択","aria.panel":"CFSail · CFSフィラメント管理","aria.photo":"Creality CFS","aria.refresh":"CFS情報を更新","aria.slot.actions":"{slot}のフィラメント操作を選択 · {status}","aria.slot.detail":"{slot} {type}の操作を選択 · {status}","aria.sources":"フィラメント供給元を選択","aria.spool":"外部スプール · {color}","color.unset":"色未設定","connection.checking":"状態を確認中","connection.connecting":"接続中","connection.delayed":"応答が遅延","connection.nocfs":"CFS未接続","connection.noinfo":"情報なし","connection.online":"接続済み","connection.synced":"情報同期済み","editor.color":"色","editor.current":"プリンターの現在値: {type} · {color}","editor.current.loaded":"プリンターの現在値: {type} · {color} · 押出機にロード済み","editor.disconnected":"接続が切れたため、保存結果を確認できませんでした。","editor.pending":"{slot}の保存結果を確認中…","editor.preset":"{preset}として保存されます。","editor.saved":"フィラメント情報を保存しました。","editor.timeout":"保存結果を確認できませんでした。スロット情報を更新してください。","editor.title":"{slot}のフィラメントを編集","editor.type":"フィラメントの種類","error.code.unknown":"コード不明","error.color":"正しい色を選択してください。","error.edit.locked":"このスロットは現在編集できません。","error.material":"プリンターの材料情報を確認できません。更新してください。","error.printer.detail":"プリンターエラー {code} · {detail}","error.printer.screen":"プリンターエラー {code} · 詳細はプリンターの画面で確認してください。","error.slot.changed":"スロットの状態が変わりました。再度確認してください。","error.state.changed":"プリンターまたはスロットの状態が変わりました。更新して再度確認してください。","error.transport":"このスロットではこの操作を実行できません。","external.info":"プリンターに登録された外部スプール情報","external.missing":"プリンターから外部スプール情報が報告されていません。","external.refresh":"外部スプール情報を確認できません。更新してください。","external.short":"Ext.","external.title":"Ext.","language.auto":"Mainsail の言語に合わせる","language.label":"言語","material.configure":"フィラメントの種類と色を設定してください。","material.unset":"未設定","menu.note":"ロード・アンロードを押すと、プリンターのノズル加熱とフィラメント移動が始まります。アンロードは、そのスロットのフィラメントが押出機にロードされている場合にのみ実行できます。","menu.status":"現在のプリンター状態を確認中…","menu.telemetry":"{activity} · {nozzle}","menu.title":"{slot}のフィラメント","nozzle.off":"ノズル {value}°C · 加熱オフ","nozzle.target.unknown":"ノズル {value}°C · 目標温度を確認中","nozzle.unknown":"ノズル温度を確認中","nozzle.value":"ノズル {value} / {target}°C","reason.busy":"フィラメント動作中です。完了後に操作してください。","reason.cfs":"CFSの接続を確認してください。","reason.configure":"先にフィラメントの種類と色を設定してください。","reason.disconnected":"プリンターとの接続が切れました。再接続後に操作してください。","reason.empty":"空のスロットです。フィラメントをセットしてください。","reason.error":"プリンターの画面でプリンターエラーを確認してください。","reason.external":"外部スプールの情報を確認できません。","reason.external.transport":"外部スプールのロード・アンロードはプリンターのタッチスクリーンで行ってください。","reason.loaded":"このスロットのフィラメントはすでに押出機にロードされています。","reason.locked":"プリンターはこのフィラメントを読み取り専用として報告しています。","reason.materials":"プリンターの材料一覧を取得しています。","reason.notloaded":"このスロットのフィラメントは押出機にロードされていません。","reason.pending":"前のリクエストの結果を確認しています。","reason.printing":"印刷中は操作できません。","reason.readonly":"閲覧専用モードでは操作できません。","reason.slot.busy":"このスロットのフィラメント動作が進行中です。","reason.stale":"プリンターの応答が遅れています。更新して再度確認してください。","reason.status":"プリンターの状態を確認しています。","reason.temperature":"フィラメントの状態と温度範囲を確認してください。","reason.unsupported":"この操作には対応していません。","slot.configure":"設定が必要","slot.empty":"空のスロット","slot.loaded":"押出機にロード済み","slot.loaded.badge":"● 押出機にロード済み","slot.loaded.summary":"{name} · 押出機にロード済み","slot.loading":"ロード中","slot.manual":"手動設定","slot.rfid":"RFID","slot.unconfigured":"フィラメント未設定","slot.unloading":"アンロード中","stage.cut":"フィラメントを切断中","stage.extrude":"フィラメントを押し出し中","stage.feed":"押出機にフィラメントを供給中","stage.idle":"フィラメント待機中","stage.load.done":"ロード完了","stage.load.heat":"ロード · ノズルを加熱中","stage.new.move":"新しいフィラメントを移動中","stage.old.retract":"使用中のフィラメントを引き戻し中","stage.other":"フィラメント動作中 · 状態 {code}","stage.position":"フィラメント位置を確認中","stage.purge":"使用中のフィラメントをパージ中","stage.retract":"フィラメントを引き戻し中","stage.target":"{slot} · {stage}","stage.unknown":"フィラメント状態を確認中","stage.unload.done":"アンロード完了","stage.unload.heat":"アンロード · ノズルを加熱中","stage.unload.prepare":"アンロードを準備中","status.checking":"プリンターの状態を確認中…","status.delayed":"プリンターの応答が遅れています · 現在の状態を確認できません。","status.printing":"印刷中 · {activity}","status.readonly":"閲覧専用 · スロットを選択すると状態を確認できます。","status.reconnecting":"プリンターとの接続が切れました。再接続中…","transport.cfs.lost":"CFSの接続が切れたため、動作結果を確認できませんでした。プリンターの画面で確認してください。","transport.disconnected":"接続が切れたため、動作結果を確認できませんでした。プリンターの画面で確認してください。","transport.load.done":"{slot}のロード完了 · 押出機にロード済み","transport.load.sent":"{slot}のロードをリクエストしました · プリンターの応答を確認中…","transport.timeout":"動作完了を確認できませんでした。プリンターの画面とフィラメントの状態を確認してください。","transport.unload.done":"{slot}のアンロード完了","transport.unload.sent":"{slot}のアンロードをリクエストしました · プリンターの応答を確認中…"},"ko":{"action.cancel":"취소","action.close":"닫기","action.edit":"종류·색상 수정","action.load":"로딩","action.save":"저장","action.unload":"언로딩","aria.cfs":"CFS {id}","aria.color":"색상 선택","aria.external.tab":"Ext. 선택","aria.lcd":"CFS {id}, 온도 {temperature}°C, 습도 {humidity}% RH","aria.palette":"{color} 선택","aria.panel":"CFSail · CFS 필라멘트 관리","aria.photo":"Creality CFS","aria.refresh":"CFS 정보 새로고침","aria.slot.actions":"{slot} 필라멘트 동작 선택 · {status}","aria.slot.detail":"{slot} {type} 동작 선택 · {status}","aria.sources":"필라멘트 공급원 선택","aria.spool":"외부 스풀 · {color}","color.unset":"색상 미설정","connection.checking":"상태 확인 중","connection.connecting":"연결 중","connection.delayed":"응답 지연","connection.nocfs":"CFS 미연결","connection.noinfo":"정보 없음","connection.online":"연결됨","connection.synced":"정보 연동됨","editor.color":"색상","editor.current":"프린터 현재 값: {type} · {color}","editor.current.loaded":"프린터 현재 값: {type} · {color} · 익스트루더에 로딩됨","editor.disconnected":"연결이 끊겨 저장 결과를 확인하지 못했습니다.","editor.pending":"{slot} 저장 결과 확인 중…","editor.preset":"{preset}로 저장됩니다.","editor.saved":"필라멘트 정보가 저장되었습니다.","editor.timeout":"저장 결과를 확인하지 못했습니다. 슬롯 정보를 새로고침해 주세요.","editor.title":"{slot} 필라멘트 수정","editor.type":"필라멘트 종류","error.code.unknown":"코드 미확인","error.color":"올바른 색상을 선택해 주세요.","error.edit.locked":"이 슬롯은 현재 편집할 수 없습니다.","error.material":"프린터 재질 정보를 확인할 수 없습니다. 새로고침해 주세요.","error.printer.detail":"프린터 오류 {code} · {detail}","error.printer.screen":"프린터 오류 {code} · 상세 내용은 프린터 화면에서 확인해 주세요.","error.slot.changed":"현재 슬롯 상태가 바뀌었습니다. 다시 확인해 주세요.","error.state.changed":"프린터 또는 슬롯 상태가 바뀌었습니다. 새로고침 후 다시 확인해 주세요.","error.transport":"이 슬롯에서 해당 동작을 실행할 수 없습니다.","external.info":"프린터에 등록된 외부 스풀 정보","external.missing":"프린터에서 외부 스풀 정보가 확인되지 않았습니다.","external.refresh":"외부 스풀 정보를 확인할 수 없습니다. 새로고침해 주세요.","external.short":"Ext.","external.title":"Ext.","language.auto":"Mainsail 언어 따라가기","language.label":"언어","material.configure":"필라멘트 종류와 색상을 설정해 주세요.","material.unset":"미설정","menu.note":"로딩·언로딩을 누르면 프린터의 노즐 가열과 필라멘트 이동이 시작됩니다. 언로딩은 해당 슬롯의 필라멘트가 익스트루더에 로딩된 경우에만 가능합니다.","menu.status":"현재 프린터 상태 확인 중…","menu.telemetry":"{activity} · {nozzle}","menu.title":"{slot} 필라멘트","nozzle.off":"노즐 {value}°C · 가열 꺼짐","nozzle.target.unknown":"노즐 {value}°C · 목표 확인 중","nozzle.unknown":"노즐 온도 확인 중","nozzle.value":"노즐 {value} / {target}°C","reason.busy":"필라멘트 동작이 진행 중입니다. 완료 후 사용해 주세요.","reason.cfs":"CFS 연결을 확인해 주세요.","reason.configure":"먼저 필라멘트 종류와 색상을 설정해 주세요.","reason.disconnected":"프린터 연결이 끊겼습니다. 재연결 후 사용해 주세요.","reason.empty":"빈 슬롯입니다. 필라멘트를 넣어 주세요.","reason.error":"프린터 오류를 프린터 화면에서 확인해 주세요.","reason.external":"외부 스풀 정보를 확인할 수 없습니다.","reason.external.transport":"외부 스풀 로딩·언로딩은 프린터 터치스크린에서 진행해 주세요.","reason.loaded":"이 슬롯의 필라멘트는 이미 익스트루더에 로딩되어 있습니다.","reason.locked":"프린터가 이 필라멘트를 읽기 전용으로 보고했습니다.","reason.materials":"프린터의 재질 목록을 확인 중입니다.","reason.notloaded":"이 슬롯의 필라멘트는 익스트루더에 로딩되어 있지 않습니다.","reason.pending":"이전 요청의 결과를 확인 중입니다.","reason.printing":"출력 중에는 실행할 수 없습니다.","reason.readonly":"조회 전용 화면에서는 실행할 수 없습니다.","reason.slot.busy":"이 슬롯의 필라멘트 동작이 진행 중입니다.","reason.stale":"프린터 응답이 지연되고 있습니다. 새로고침 후 확인해 주세요.","reason.status":"프린터 상태를 확인 중입니다.","reason.temperature":"필라멘트의 상태 또는 온도 범위를 확인해 주세요.","reason.unsupported":"지원하지 않는 동작입니다.","slot.configure":"설정 필요","slot.empty":"빈 슬롯","slot.loaded":"익스트루더에 로딩됨","slot.loaded.badge":"● 익스트루더에 로딩됨","slot.loaded.summary":"{name} · 익스트루더에 로딩됨","slot.loading":"로딩 중","slot.manual":"수동 설정","slot.rfid":"RFID","slot.unconfigured":"필라멘트 미설정","slot.unloading":"언로딩 중","stage.cut":"필라멘트 커팅 중","stage.extrude":"필라멘트 압출 중","stage.feed":"익스트루더에 필라멘트 공급 중","stage.idle":"필라멘트 대기","stage.load.done":"로딩 완료","stage.load.heat":"로딩 · 노즐 가열 중","stage.new.move":"새 필라멘트 이동 중","stage.old.retract":"기존 필라멘트 회수 중","stage.other":"필라멘트 동작 중 · 상태 {code}","stage.position":"필라멘트 위치 확인 중","stage.purge":"기존 필라멘트 퍼지 중","stage.retract":"필라멘트 회수 중","stage.target":"{slot} · {stage}","stage.unknown":"필라멘트 상태 확인 중","stage.unload.done":"언로딩 완료","stage.unload.heat":"언로딩 · 노즐 가열 중","stage.unload.prepare":"언로딩 준비 중","status.checking":"프린터 상태 확인 중…","status.delayed":"프린터 응답 지연 · 현재 상태를 확인할 수 없습니다.","status.printing":"출력 상태 · {activity}","status.readonly":"조회 전용 · 슬롯을 눌러 상태를 확인할 수 있습니다.","status.reconnecting":"프린터 연결이 끊겼습니다. 재연결 중…","transport.cfs.lost":"CFS 연결이 끊겨 동작 결과를 확인하지 못했습니다. 프린터 화면에서 확인해 주세요.","transport.disconnected":"연결이 끊겨 동작 결과를 확인하지 못했습니다. 프린터 화면에서 확인해 주세요.","transport.load.done":"{slot} 로딩 완료 · 익스트루더에 로딩됨","transport.load.sent":"{slot} 로딩 요청 전송 · 프린터 응답 확인 중…","transport.timeout":"동작 완료를 확인하지 못했습니다. 프린터 화면과 필라멘트 상태를 확인해 주세요.","transport.unload.done":"{slot} 언로딩 완료","transport.unload.sent":"{slot} 언로딩 요청 전송 · 프린터 응답 확인 중…"},"zh":{"action.cancel":"取消","action.close":"关闭","action.edit":"编辑类型和颜色","action.load":"进料","action.save":"保存","action.unload":"退料","aria.cfs":"CFS {id}","aria.color":"选择颜色","aria.external.tab":"选择 Ext.","aria.lcd":"CFS {id}，温度 {temperature}°C，相对湿度 {humidity}%","aria.palette":"选择 {color}","aria.panel":"CFSail · CFS 耗材管理","aria.photo":"Creality CFS","aria.refresh":"刷新 CFS 信息","aria.slot.actions":"选择 {slot} 的耗材操作 · {status}","aria.slot.detail":"选择 {slot}（{type}）的操作 · {status}","aria.sources":"选择耗材来源","aria.spool":"外置料盘 · {color}","color.unset":"颜色未设置","connection.checking":"正在获取状态","connection.connecting":"正在连接","connection.delayed":"响应延迟","connection.nocfs":"CFS 未连接","connection.noinfo":"暂无信息","connection.online":"已连接","connection.synced":"信息已同步","editor.color":"颜色","editor.current":"打印机当前值：{type} · {color}","editor.current.loaded":"打印机当前值：{type} · {color} · 已进入挤出机","editor.disconnected":"连接已断开，无法确认保存结果。","editor.pending":"正在确认 {slot} 的保存结果…","editor.preset":"将保存为 {preset}。","editor.saved":"耗材信息已保存。","editor.timeout":"无法确认保存结果，请刷新插槽信息。","editor.title":"编辑 {slot} 耗材","editor.type":"耗材类型","error.code.unknown":"未知代码","error.color":"请选择有效的颜色。","error.edit.locked":"此插槽目前无法编辑。","error.material":"无法获取打印机材料信息，请刷新。","error.printer.detail":"打印机错误 {code} · {detail}","error.printer.screen":"打印机错误 {code} · 请在 打印机 屏幕上查看详情。","error.slot.changed":"插槽当前状态已改变，请重新检查。","error.state.changed":"打印机或插槽状态已改变，请刷新后重试。","error.transport":"此插槽无法执行该操作。","external.info":"打印机报告的外置料盘信息","external.missing":"打印机尚未报告外置料盘信息。","external.refresh":"无法获取外置料盘信息，请刷新。","external.short":"Ext.","external.title":"Ext.","language.auto":"跟随 Mainsail 语言","language.label":"语言","material.configure":"请设置耗材类型和颜色。","material.unset":"未设置","menu.note":"点击进料或退料将启动 打印机的喷嘴加热和耗材移动。只有耗材已进入挤出机的插槽才能退料。","menu.status":"正在获取打印机当前状态…","menu.telemetry":"{activity} · {nozzle}","menu.title":"{slot} 耗材","nozzle.off":"喷嘴 {value}°C · 加热已关闭","nozzle.target.unknown":"喷嘴 {value}°C · 正在获取目标温度","nozzle.unknown":"正在获取喷嘴温度","nozzle.value":"喷嘴 {value} / {target}°C","reason.busy":"耗材操作正在进行中，请等待完成。","reason.cfs":"请检查 CFS 连接。","reason.configure":"请先设置耗材类型和颜色。","reason.disconnected":"打印机连接已断开，请等待重新连接。","reason.empty":"此插槽为空，请放入耗材。","reason.error":"请在 打印机 屏幕上查看打印机错误。","reason.external":"无法获取外置料盘信息。","reason.external.transport":"请通过 打印机 触摸屏对外置料盘进行进料或退料。","reason.loaded":"此插槽的耗材已进入挤出机。","reason.locked":"打印机报告此耗材为只读。","reason.materials":"正在获取打印机材料列表。","reason.notloaded":"此插槽的耗材尚未进入挤出机。","reason.pending":"正在确认上一次请求的结果。","reason.printing":"打印过程中无法执行操作。","reason.readonly":"只读模式下无法执行操作。","reason.slot.busy":"此插槽的耗材操作正在进行中。","reason.stale":"打印机响应延迟，请刷新后重试。","reason.status":"正在获取打印机状态。","reason.temperature":"请检查耗材状态和温度范围。","reason.unsupported":"不支持此操作。","slot.configure":"需要设置","slot.empty":"空插槽","slot.loaded":"耗材已进入挤出机","slot.loaded.badge":"● 已进入挤出机","slot.loaded.summary":"{name} · 已进入挤出机","slot.loading":"正在进料","slot.manual":"手动设置","slot.rfid":"RFID","slot.unconfigured":"耗材未设置","slot.unloading":"正在退料","stage.cut":"正在切断耗材","stage.extrude":"正在挤出耗材","stage.feed":"正在向挤出机输送耗材","stage.idle":"耗材待机","stage.load.done":"进料完成","stage.load.heat":"进料 · 正在加热喷嘴","stage.new.move":"正在输送新耗材","stage.old.retract":"正在回抽原有耗材","stage.other":"耗材操作进行中 · 状态 {code}","stage.position":"正在检查耗材位置","stage.purge":"正在清除原有耗材","stage.retract":"正在回抽耗材","stage.target":"{slot} · {stage}","stage.unknown":"正在获取耗材状态","stage.unload.done":"退料完成","stage.unload.heat":"退料 · 正在加热喷嘴","stage.unload.prepare":"正在准备退料","status.checking":"正在获取打印机状态…","status.delayed":"打印机响应延迟 · 无法获取当前状态。","status.printing":"打印中 · {activity}","status.readonly":"只读模式 · 选择插槽可查看状态。","status.reconnecting":"打印机连接已断开，正在重新连接…","transport.cfs.lost":"CFS 连接已断开，无法确认操作结果，请查看 打印机 屏幕。","transport.disconnected":"连接已断开，无法确认操作结果，请查看 打印机 屏幕。","transport.load.done":"{slot} 进料完成 · 已进入挤出机","transport.load.sent":"已发送 {slot} 进料请求 · 正在等待打印机确认…","transport.timeout":"无法确认操作完成，请检查 打印机 屏幕和耗材状态。","transport.unload.done":"{slot} 退料完成","transport.unload.sent":"已发送 {slot} 退料请求 · 正在等待打印机确认…"}};
  const normalizeLanguage = value => {
    const base = String(value || '').trim().toLowerCase().replace(/_/g, '-').split('-')[0];
    return Object.prototype.hasOwnProperty.call(catalogs, base) ? base : 'en';
  };
  const installationLanguage = normalizeLanguage(typeof document !== 'undefined' ? document.currentScript?.dataset.lang :
    (typeof module !== 'undefined' && module.exports ? 'ko' : 'en'));
  let languageMode = 'auto';
  if (typeof document !== 'undefined') {
    try {
      const saved = root.localStorage?.getItem('cfsail.languageMode');
      if (Object.prototype.hasOwnProperty.call(catalogs, saved)) languageMode = saved;
    } catch (_) { /* Use automatic synchronization when storage is blocked. */ }
  }
  function mainsailLanguage() {
    const app = typeof document !== 'undefined' ? document.querySelector('#app')?.__vue__ : null;
    return app?.$store?.state?.gui?.general?.language || app?.$i18n?.locale || installationLanguage;
  }
  let language = languageMode === 'auto' ? normalizeLanguage(mainsailLanguage()) : languageMode;
  function setLanguage(value) { language = normalizeLanguage(value); return language; }
  function t(key, params = {}) {
    const template = catalogs[language]?.[key] ?? catalogs.en[key];
    if (typeof template !== 'string') throw new Error('Missing translation: ' + key);
    return template.replace(/\{([a-zA-Z][a-zA-Z0-9]*)\}/g, (_, name) => {
      if (!Object.prototype.hasOwnProperty.call(params, name)) throw new Error('Missing translation parameter: ' + key + '.' + name);
      return String(params[name]);
    });
  }
  const displaySlotLabel = slot => slot?.kind === 'external' ? t('external.short') : slot?.label;
  const uiLanguage = () => language === 'zh' ? 'zh-Hans' : language;
  const slotStatusText = (slot, loaded) => loaded ? t('slot.loaded') : t({
    empty: 'slot.empty', unconfigured: 'slot.configure', feeding: 'slot.loading',
    retracting: 'slot.unloading', rfid: 'slot.rfid', manual: 'slot.manual'
  }[slot.status]);

  const letters = ['A', 'B', 'C', 'D'];
  const number = value => value === null || value === undefined || value === '' ? null :
    (Number.isFinite(Number(value)) ? Number(value) : null);

  function normalizeColor(value) {
    let hex = String(value || '').replace(/^#/, '');
    if (hex.length === 7 && hex[0] === '0') hex = hex.slice(1);
    return /^[0-9a-f]{6}$/i.test(hex) ? '#' + hex.toUpperCase() : null;
  }

  function normalizeBoxes(info) {
    return (Array.isArray(info?.materialBoxs) ? info.materialBoxs : [])
      .filter(box => Number(box.type) === 0 && Number.isInteger(Number(box.id)) && Number(box.id) > 0)
      .map(box => ({
        id: Number(box.id), connected: Number(box.state) === 1,
        temp: number(box.temp), humidity: number(box.humidity),
        slots: letters.map((letter, index) => {
          const raw = (Array.isArray(box.materials) ? box.materials : []).find(m => Number(m.id) === index) || {};
          const state = number(raw.state) || 0;
          const type = String(raw.type || '').trim();
          const configured = !!type && !['?', '-', 'UNKNOWN', 'NONE'].includes(type.toUpperCase());
          const status = state === 0 ? 'empty' : state === 3 ? 'feeding' : state === 4 ? 'retracting' :
            !configured || Number(raw.editStatus) === 2 ? 'unconfigured' : state === 2 ? 'rfid' : 'manual';
          return {
            boxId: Number(box.id), index, label: String(box.id) + letter, state, status,
            type, name: String(raw.name || ''), vendor: String(raw.vendor || ''),
            color: state > 0 ? normalizeColor(raw.color) : null,
            selected: state > 0 && Number(raw.selected) === 1,
            editable: state > 0 && state !== 3 && state !== 4 && Number(raw.editStatus) > 0,
            raw
          };
        })
      })).sort((a, b) => a.id - b.id);
  }

  function genericPresets(materials) {
    return (Array.isArray(materials) ? materials : []).flatMap(item => {
      const base = item.base || {}, kv = item.kvParam || {};
      if (String(base.brand).toLowerCase() !== 'generic') return [];
      const minTemp = number(base.minTemp) ?? number(kv.nozzle_temperature_range_low);
      const maxTemp = number(base.maxTemp) ?? number(kv.nozzle_temperature_range_high);
      const pressure = number(kv.pressure_advance);
      const type = String(base.meterialType || base.materialType || '').trim();
      if (!base.id || !base.name || !type || minTemp === null || maxTemp === null ||
          minTemp <= 0 || maxTemp < minTemp || pressure === null || pressure < 0) return [];
      return [{ id: String(base.id), type, name: String(base.name), vendor: 'Generic', minTemp, maxTemp, pressure }];
    }).sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name));
  }

  function normalizeSources(info) {
    const sources = normalizeBoxes(info).map(box => ({ ...box, kind: 'cfs' }));
    const external = (Array.isArray(info?.materialBoxs) ? info.materialBoxs : [])
      .find(box => number(box.id) === 0 && Number(box.type) === 1);
    if (external) {
      // The spool holder is reported with enclosure state 0 even when editable.
      // Keep its real slot state; enclosure connectivity applies only to CFS.
      const raw = (Array.isArray(external.materials) ? external.materials : []).find(slot => number(slot.id) === 0);
      const slot = normalizeBoxes({ materialBoxs: [{ ...external, id: 1, type: 0, materials: raw ? [raw] : [] }] })[0].slots[0];
      sources.push({ id: 0, kind: 'external', connected: !!raw, temp: null, humidity: null,
        slots: [{ ...slot, boxId: 0, index: 0, label: 'Ext.', kind: 'external',
          color: normalizeColor(raw?.color), editable: !!raw && slot.editable }] });
    }
    return sources;
  }

  function buildEdit(slot, preset, color) {
    if (!slot?.editable) throw new Error(t('error.edit.locked'));
    const normalized = normalizeColor(color);
    if (!normalized) throw new Error(t('error.color'));
    if (!preset?.id || !preset.type || !preset.name || preset.vendor !== 'Generic' ||
        !Number.isFinite(preset.minTemp) || !Number.isFinite(preset.maxTemp) ||
        preset.minTemp <= 0 || preset.maxTemp < preset.minTemp ||
        !Number.isFinite(preset.pressure) || preset.pressure < 0 ||
        !Number.isInteger(slot.boxId) || !Number.isInteger(slot.index) ||
        !(slot.kind === 'external' ? slot.boxId === 0 && slot.index === 0 :
          slot.boxId >= 1 && slot.boxId <= 4 && slot.index >= 0 && slot.index <= 3)) {
      throw new Error(t('error.material'));
    }
    return { method: 'set', params: { modifyMaterial: {
      boxId: slot.boxId, id: slot.index, rfid: preset.id, type: preset.type,
      vendor: 'Generic', name: preset.name, color: '#0' + normalized.slice(1).toLowerCase(),
      // Match official CrealityPrint: K2 ignores integer JSON temperature fields.
      minTemp: preset.minTemp + 1e-8, maxTemp: preset.maxTemp + 1e-8, pressure: preset.pressure
    } } };
  }

  function editConfirmed(info, edit) {
    const expected = edit.params.modifyMaterial;
    const slot = normalizeSources(info).find(b => b.id === expected.boxId)?.slots[expected.id];
    return !!slot && slot.state > 0 && slot.type === expected.type &&
      slot.color === normalizeColor(expected.color) && String(slot.raw.rfid) === expected.rfid &&
      slot.name === expected.name && slot.vendor === expected.vendor &&
      ['minTemp', 'maxTemp', 'pressure'].every(key => expected[key] === undefined ||
        (number(slot.raw[key]) !== null && Math.abs(number(slot.raw[key]) - expected[key]) < 0.00001));
  }

  function editingAllowed(state) {
    return !!(state.connected && state.cfsConnected && state.boxConnected && state.editable &&
      state.hasPresets && state.stateKnown && state.feedKnown && !state.readOnly &&
      !state.printing && !state.busy && !state.pending);
  }

  function updateTelemetry(current, data) {
    const next = { ...current };
    if ('state' in data) {
      next.stateKnown = number(data.state) !== null;
      next.printing = !next.stateKnown || ![0, 2, 3, 4].includes(Number(data.state));
    }
    if ('feedState' in data) {
      next.feedKnown = number(data.feedState) !== null;
      // Official CrealityPrint treats Finish (3) and Retract Finish (14) as idle.
      next.busy = !next.feedKnown || ![0, 3, 14].includes(Number(data.feedState));
    }
    return next;
  }

  function transportSlotValid(slot) {
    return !!(slot && Number.isInteger(slot.boxId) && slot.boxId > 0 && slot.boxId <= 4 &&
      Number.isInteger(slot.index) && slot.index >= 0 && slot.index < 4 && [1, 2].includes(slot.state) &&
      slot.status !== 'unconfigured' && slot.type && slot.color &&
      number(slot.raw?.minTemp) > 0 && number(slot.raw?.maxTemp) >= number(slot.raw?.minTemp) &&
      number(slot.raw?.maxTemp) <= 350);
  }
  function transportAllowed(state, slot, action) {
    return !!(transportSlotValid(slot) && ['load', 'unload'].includes(action) &&
      (action === 'unload' ? slot.selected : !slot.selected) &&
      state.connected && state.cfsConnected && state.boxConnected && state.stateKnown && state.feedKnown && state.fresh &&
      !state.readOnly && !state.printing && !state.busy && !state.pending && !state.printerError);
  }
  function buildTransport(slot, action) {
    if (!transportSlotValid(slot) || !['load', 'unload'].includes(action) ||
        (action === 'unload' ? !slot.selected : slot.selected)) throw new Error(t('error.transport'));
    // Exact official CrealityPrint LAN payload. Firmware performs heating/change/purge.
    return { method: 'set', params: { feedInOrOut: { boxId: slot.boxId, materialId: slot.index, isFeed: action === 'load' ? 1 : 0 } } };
  }
  function applyMaterialState(current, delta) {
    if (!delta || !Array.isArray(current?.materialBoxs)) return current;
    return { ...current, materialBoxs: current.materialBoxs.map(box => Number(box.id) !== Number(delta.boxId) ? box :
      { ...box, materials: (box.materials || []).map(slot => Number(slot.id) !== Number(delta.materialId) ? slot :
        { ...slot, ...Object.fromEntries(['state', 'selected', 'editStatus', 'percent', 'type', 'color', 'name', 'vendor', 'rfid',
          'minTemp', 'maxTemp', 'pressure'].filter(k => k in delta).map(k => [k, delta[k]])) }) }) };
  }
  function transportConfirmed(info, operation, feedState) {
    if (!operation || ![0, 3, 14].includes(number(feedState))) return false;
    const slot = normalizeBoxes(info).find(b => b.id === operation.boxId)?.slots[operation.index];
    if (!slot || !['load', 'unload'].includes(operation.action)) return false;
    return operation.action === 'load' ? slot.selected && [1, 2].includes(slot.state) :
      Number(slot.raw.selected) === 0 && [0, 1, 2].includes(slot.state);
  }
  function isLoaded(slot, state) {
    return !!(state.online && state.fresh && slot?.selected && [1, 2].includes(slot.state));
  }
  function statusFresh(state, now = Date.now()) {
    // K2 sends initial printer/feed status followed by changes only. A recent reply
    // on this same connection proves liveness; unchanged fields must stay known.
    return !!(state.connected && state.stateKnown && state.feedKnown && state.lastBoxAt > 0 &&
      now >= state.lastBoxAt && now - state.lastBoxAt < 10000);
  }
  function updateDisplayTelemetry(current, data) {
    const next = { ...current };
    if ('feedState' in data) next.feedState = number(data.feedState);
    if ('nozzleTemp' in data) next.nozzle = number(data.nozzleTemp);
    if ('targetNozzleTemp' in data) next.target = number(data.targetNozzleTemp);
    else if ('nozzleTemp2' in data) next.target = number(data.nozzleTemp2);
    if ('err' in data) next.error = data.err && typeof data.err === 'object' ? { ...data.err } : { key: null };
    return next;
  }
  function errorText(error) {
    const code = number(error?.key);
    if (code === 0 || !error) return '';
    const detail = typeof error.value === 'string' ? error.value.trim() : '';
    return t(detail ? 'error.printer.detail' : 'error.printer.screen', { code: code ?? t('error.code.unknown'), detail });
  }
  function nozzleText(telemetry) {
    const nozzle = number(telemetry.nozzle), target = number(telemetry.target);
    if (nozzle === null) return t('nozzle.unknown');
    const value = Number(nozzle.toFixed(1));
    return t(target === 0 ? 'nozzle.off' : target === null ? 'nozzle.target.unknown' : 'nozzle.value',
      { value, target: target === null ? '' : Number(target.toFixed(1)) });
  }
  function activityText(info, telemetry, operation) {
    const stages = { 0: t('stage.idle'), 1: t('stage.load.heat'), 2: t('stage.extrude'), 3: t('stage.load.done'),
      11: t('stage.unload.heat'), 12: t('stage.unload.prepare'), 13: t('stage.retract'), 14: t('stage.unload.done'),
      101: t('stage.load.heat'), 102: t('stage.position'), 103: t('stage.cut'),
      104: t('stage.old.retract'), 105: t('stage.new.move'), 106: t('stage.feed'),
      107: t('stage.purge'), 111: t('stage.position'), 112: t('stage.cut'),
      113: t('stage.old.retract'), 114: t('stage.purge'), 150: t('stage.load.heat'),
      151: t('stage.position'), 152: t('stage.feed'), 153: t('stage.purge'),
      160: t('stage.unload.heat'), 161: t('stage.position'), 162: t('stage.cut'), 163: t('stage.old.retract') };
    const code = number(telemetry.feedState);
    if (code === null) return t('stage.unknown');
    const slots = normalizeSources(info).flatMap(b => b.slots).filter(s => [3,4].includes(s.state));
    const target = slots.length === 1 ? displaySlotLabel(slots[0]) : operation ? String(operation.boxId) + letters[operation.index] : '';
    const stage = stages[code] || t('stage.other', { code });
    return target ? t('stage.target', { slot: target, stage }) : stage;
  }
  function actionReason(state, slot, action) {
    if (state.readOnly) return t('reason.readonly');
    if (!state.connected) return t('reason.disconnected');
    if (!state.stateKnown || !state.feedKnown) return t('reason.status');
    if (!state.fresh) return t('reason.stale');
    if ((!state.cfsConnected && slot?.kind !== 'external') || !state.boxConnected)
      return slot?.kind === 'external' ? t('reason.external') : t('reason.cfs');
    if (state.printerError) return errorText(state.error) || t('reason.error');
    if (state.printing) return t('reason.printing');
    if (state.pending) return t('reason.pending');
    if (state.busy) return t('reason.busy');
    if (!slot || slot.state === 0) return t('reason.empty');
    if ([3,4].includes(slot.state)) return t('reason.slot.busy');
    if (action === 'edit') {
      if (!slot.editable) return t('reason.locked');
      if (!state.hasPresets) return t('reason.materials');
      return '';
    }
    if (slot.kind === 'external') return t('reason.external.transport');
    if (!['load','unload'].includes(action)) return t('reason.unsupported');
    if (slot.status === 'unconfigured' || !slot.type || !slot.color) return t('reason.configure');
    if (!transportSlotValid(slot)) return t('reason.temperature');
    if (action === 'load' && slot.selected) return t('reason.loaded');
    if (action === 'unload' && !slot.selected) return t('reason.notloaded');
    return '';
  }

  const api = { setLanguage, normalizeLanguage, t, normalizeColor, normalizeBoxes, normalizeSources, genericPresets, buildEdit, editConfirmed, editingAllowed, updateTelemetry,
    buildTransport, transportAllowed, applyMaterialState, transportConfirmed, isLoaded, statusFresh,
    updateDisplayTelemetry, errorText, nozzleText, activityText, actionReason };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else { root.CFSail = api; root.NoyeahCFS = api; }
  if (typeof document === 'undefined' || root.__noyeahCfsPanel) return;
  root.__noyeahCfsPanel = true;

  const script = document.currentScript;
  const imageUrl = new URL('cfs.png', script?.src || location.href).href;
  const wsUrl = script?.dataset.wsUrl || 'ws://' + location.hostname + ':9999';
  const readOnly = script?.dataset.readOnly === 'true';
  const nativeLayout = script?.dataset.nativeLayout === 'true';
  const panel = document.createElement('section');
  panel.lang = uiLanguage();
  panel.id = 'noyeah-cfs-panel';
  panel.dataset.version = '0.1.0';
  panel.dataset.product = 'CFSail';
  panel.className = 'v-card v-sheet theme--dark mb-3 mb-md-6';
  panel.setAttribute('aria-label', t('aria.panel'));
  let socket, reconnectTimer, saveTimer, queryTimer, motionTimer, info = {}, boxes = [], presets = [],
    socketConnected = false, cfsConnected = null, printing = false, busy = false,
    stateKnown = false, feedKnown = false, lastRenderKey = '',
    selectedBox = 1, modal = null, pending = null, motion = null, feedState = null, printerError = false,
    lastBoxAt = 0, message = '', messageError = false, displayTelemetry = { feedState: null, nozzle: null, target: null, error: null };

  const style = document.createElement('style');
  style.textContent = `
    #noyeah-cfs-panel{color:#ededed;background:#202124;border-radius:8px;overflow:hidden;font-family:inherit;container-type:inline-size}
    #noyeah-cfs-panel *,#ncfs-modal *{box-sizing:border-box}
    #noyeah-cfs-panel button,#noyeah-cfs-panel select,#ncfs-modal button,#ncfs-modal input,#ncfs-modal select{font:inherit}
    #noyeah-cfs-panel button,#ncfs-modal button{cursor:pointer}
    #noyeah-cfs-panel button:disabled,#ncfs-modal button:disabled{cursor:default;opacity:.4}
    #noyeah-cfs-panel button:focus-visible,#noyeah-cfs-panel select:focus-visible,#ncfs-modal button:focus-visible,#ncfs-modal input:focus-visible,#ncfs-modal select:focus-visible{outline:2px solid #42cda4;outline-offset:3px}
    #noyeah-cfs-panel .ncfs-head{display:flex;align-items:center;justify-content:flex-end;gap:10px;min-height:52px;padding:10px 16px;border-bottom:1px solid #ffffff12}
    #noyeah-cfs-panel .ncfs-source-tabs{display:flex;align-items:center;gap:5px;overflow-x:auto;min-width:0;flex:1;scrollbar-width:thin;padding:3px}
    #noyeah-cfs-panel .ncfs-source-tab{flex-shrink:0;white-space:nowrap;border:1px solid #ffffff1a;border-radius:5px;background:transparent;color:#aeb3bd;padding:6px 9px;font-size:14px;font-weight:600}
    #noyeah-cfs-panel .ncfs-source-tab.active{color:#ededed;border-color:#65d7b5;background:#65d7b514}
    #noyeah-cfs-panel .ncfs-source-tab.offline{color:#92969e}
    @container(max-width:420px){#noyeah-cfs-panel .ncfs-head{flex-wrap:wrap;gap:6px}#noyeah-cfs-panel .ncfs-source-tabs{flex-basis:100%;flex-wrap:wrap;overflow:visible}#noyeah-cfs-panel .ncfs-source-tab{padding:6px 8px}}
    #noyeah-cfs-panel .ncfs-head .ncfs-dot,#noyeah-cfs-panel .ncfs-head .ncfs-status,#noyeah-cfs-panel .ncfs-refresh{flex-shrink:0}
    #noyeah-cfs-panel .ncfs-ext-visual{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;min-height:240px;margin:8px 12px;background:#151617;border:2px solid transparent;border-radius:6px;padding:24px;text-align:center}
    #noyeah-cfs-panel .ncfs-ext-visual.selected{border-color:#00e676}
    #noyeah-cfs-panel .ncfs-spool{position:relative;width:142px;height:142px;border:12px solid #868b91;border-radius:50%;background:repeating-radial-gradient(circle at center,transparent 0 3px,#0003 3px 5px),var(--spool-color,#51545a);box-shadow:inset 0 0 0 5px #1f2125,0 6px 12px #0005}
    #noyeah-cfs-panel .ncfs-spool:after{content:'';position:absolute;width:42px;height:42px;left:50%;top:50%;transform:translate(-50%,-50%);background:#151617;border:9px solid #a0a5ab;border-radius:50%}
    #noyeah-cfs-panel .ncfs-ext-title{font-size:18px;font-weight:600}
    #noyeah-cfs-panel .ncfs-ext-detail{font-size:12px;color:#aeb3bd;line-height:1.6}
    #noyeah-cfs-panel .ncfs-ext-card{display:block;width:calc(100% - 32px);margin:10px 16px 14px}
    #noyeah-cfs-panel .ncfs-ext-action{margin-top:12px;padding:8px 12px;border:1px solid #65d7b560;border-radius:5px;background:#65d7b514;color:#79d5b8}
    #noyeah-cfs-panel .ncfs-ext-reason{margin-top:8px;color:#aeb3bd;font-size:12px;line-height:1.5}
    #noyeah-cfs-panel .ncfs-dot{width:7px;height:7px;border-radius:50%;background:#828282}
    #noyeah-cfs-panel .ncfs-dot.online{background:#50d4a7;box-shadow:0 0 8px #50d4a744}
    #noyeah-cfs-panel .ncfs-status{font-size:12px;color:#b8bbc1}
    #noyeah-cfs-panel .ncfs-refresh{border:0;background:transparent;color:#b8bbc1;border-radius:5px;padding:6px}
    #noyeah-cfs-panel .ncfs-visual{position:relative;container-type:inline-size;aspect-ratio:1600/920;background:#151617;overflow:hidden;margin:8px 12px 0;border-radius:6px}
    #noyeah-cfs-panel .ncfs-photo{position:absolute;width:100%;height:auto;top:-39.13%;left:0;filter:grayscale(1);pointer-events:none}
    #noyeah-cfs-panel .ncfs-tints{position:absolute;inset:0;width:100%;height:100%;mix-blend-mode:multiply;pointer-events:none}
    #noyeah-cfs-panel .ncfs-image-labels{position:absolute;inset:0;pointer-events:none}
    #noyeah-cfs-panel .ncfs-image-label{position:absolute;bottom:46.5%;width:15%;height:clamp(14px,4.8cqw,28px);display:flex;align-items:center;justify-content:center;border-radius:5px;background:#111c;border:1px solid #ffffff22;color:#fff;text-align:center;font-size:clamp(9px,2cqw,12px);line-height:1;white-space:nowrap;padding:0 2px;box-shadow:0 2px 8px #0006}
    #noyeah-cfs-panel .ncfs-image-label.selected{border:2px solid #00e676;color:#00e676}
    #noyeah-cfs-panel .ncfs-reel-hit{position:absolute;top:15.5%;height:38%;width:15%;padding:0;background:transparent;border:2px solid transparent;border-radius:5px;pointer-events:auto}
    #noyeah-cfs-panel .ncfs-reel-hit.selected{border-color:#00e676;box-shadow:0 0 0 1px #00e67644,0 0 10px #00e67644}
    #noyeah-cfs-panel .ncfs-reel-hit:hover:not(:disabled){background:#ffffff0b}
    #noyeah-cfs-panel .ncfs-slots{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:10px 16px 14px}
    #noyeah-cfs-panel .ncfs-slot{border:1px solid #ffffff20;border-radius:7px;background:#292b2e;min-width:0;text-align:left;padding:10px;color:inherit;position:relative}
    #noyeah-cfs-panel .ncfs-slot.selected{border:2px solid #00e676;padding:9px;background:#273631;box-shadow:0 0 0 1px #00e67622}
    #noyeah-cfs-panel .ncfs-slot.unconfigured{border-style:dashed}
    #noyeah-cfs-panel .ncfs-slot.empty{opacity:.55}
    #noyeah-cfs-panel .ncfs-slot:disabled{opacity:1}
    #noyeah-cfs-panel .ncfs-slot.empty:disabled{opacity:.55}
    #noyeah-cfs-panel .ncfs-slot-top{display:flex;align-items:center;justify-content:space-between;gap:4px;font-size:12px;color:#b9bdc6;margin-bottom:8px}
    #noyeah-cfs-panel .ncfs-swatch{width:20px;height:20px;border-radius:50%;border:1px solid #ffffff55;display:block;flex-shrink:0}
    #noyeah-cfs-panel .ncfs-swatch.unknown{background:repeating-linear-gradient(45deg,#51545a 0 3px,#303237 3px 6px)}
    #noyeah-cfs-panel .ncfs-type{display:block;font-weight:650;font-size:17px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    #noyeah-cfs-panel .ncfs-name{display:block;color:#aeb3bd;font-size:11px;margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    #noyeah-cfs-panel .ncfs-tag{display:block;font-size:10px;color:#78cfb5;margin-top:7px;min-height:15px}
    #noyeah-cfs-panel .ncfs-hint{padding:0 16px 12px;font-size:12px;color:#aeb3bd;line-height:1.5}
    #noyeah-cfs-panel .ncfs-lcd{position:absolute;left:38.5%;top:65.2%;width:23%;height:18%;background:#242625;border:1px solid #ffffff18;border-radius:4px;display:flex;align-items:center;justify-content:center;gap:9%;color:#ecefee;font:600 clamp(12px,3.8cqw,24px) system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI","Malgun Gothic",sans-serif;font-variant-numeric:tabular-nums;pointer-events:none}
    #noyeah-cfs-panel .ncfs-lcd-values{display:flex;flex-direction:column;line-height:1.2;white-space:nowrap}
    #noyeah-cfs-panel .ncfs-lcd-unit{font-size:.5em;font-weight:400;margin-left:3px;color:#c8d0cc}
    #noyeah-cfs-panel .ncfs-lcd-box{border-left:1px solid #bbb8;padding-left:10%;font-size:1.1em;font-weight:400}
    #noyeah-cfs-panel .ncfs-notice{padding:9px 16px;color:#79d5b8;font-size:12px;border-top:1px solid #ffffff12;line-height:1.5}
    #noyeah-cfs-panel .ncfs-notice.error{color:#ffb3a9}
    #noyeah-cfs-panel .ncfs-live-status{padding:9px 16px;border-top:1px solid #ffffff12;color:#c3c9cf;font-size:12px;line-height:1.65}
    #noyeah-cfs-panel .ncfs-live-status .busy{color:#ffcf7c}
    #noyeah-cfs-panel .ncfs-live-status .error{color:#ffb3a9}
    #noyeah-cfs-panel .ncfs-status-row{display:flex;align-items:baseline;justify-content:space-between;gap:8px}
    #noyeah-cfs-panel .ncfs-activity{flex:1;min-width:0}
    #noyeah-cfs-panel .ncfs-language-footer{display:flex;align-items:baseline;justify-content:flex-end;flex-shrink:0;gap:6px;color:#aeb3bd;font-size:12px}
    #noyeah-cfs-panel .ncfs-language-select{max-width:100%;font-size:12px;padding:5px 8px;border:1px solid #ffffff26;border-radius:5px;background:#292b2e;color:#ededed;color-scheme:dark;cursor:pointer}
    #noyeah-cfs-panel .ncfs-language-select:disabled{cursor:default;opacity:.5}
    #ncfs-modal{position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px;background:#0009;font-family:inherit;color:#ededed}
    #ncfs-modal .ncfs-dialog{width:380px;max-width:100%;max-height:90vh;overflow:auto;background:#25272b;border:1px solid #ffffff22;border-radius:10px;box-shadow:0 15px 50px #0008;padding:22px}
    #ncfs-modal h2{font-size:18px;font-weight:600;margin:0 0 20px}
    #ncfs-modal label{display:block;color:#bdc2cb;font-size:13px;margin-top:18px}
    #ncfs-modal select,#ncfs-modal input[type=text]{background:#1c1e22;color:#ededed;border:1px solid #ffffff30;border-radius:6px;padding:10px;width:100%;margin-top:7px}
    #ncfs-modal .ncfs-color-row{display:flex;align-items:center;gap:10px}
    #ncfs-modal input[type=color]{width:48px;height:40px;flex-shrink:0;padding:3px;border:1px solid #ffffff30;border-radius:6px;background:#1c1e22;margin-top:7px}
    #ncfs-modal .ncfs-palette{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
    #ncfs-modal .ncfs-palette button{width:24px;height:24px;border:1px solid #ffffff55;border-radius:50%}
    #ncfs-modal .ncfs-modal-note{font-size:12px;color:#9fa7b3;line-height:1.6;margin:18px 0 0}
    #ncfs-modal .ncfs-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:22px}
    #ncfs-modal .ncfs-actions button{border:1px solid #ffffff30;border-radius:6px;background:transparent;color:#ddd;padding:8px 18px}
    #ncfs-modal .ncfs-actions .ncfs-save{background:#3fc099;border-color:#3fc099;color:#10251e;font-weight:600}
    #ncfs-modal .ncfs-form-error{font-size:12px;color:#ffb3a9;margin-top:12px;line-height:1.5}
    #ncfs-modal .ncfs-slot-summary{display:flex;align-items:center;gap:10px;margin-bottom:16px;font-size:14px}
    #ncfs-modal .ncfs-slot-summary .ncfs-swatch{width:22px;height:22px;border:1px solid #ffffff66;border-radius:50%;flex-shrink:0}
    #ncfs-modal .ncfs-choice-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px}
    #ncfs-modal .ncfs-choice-actions button{padding:12px;border:1px solid #ffffff35;border-radius:6px;color:#ededed;background:#313438}
    #ncfs-modal .ncfs-choice-actions .ncfs-load{border-color:#42cda4;color:#78dfbc}
    #ncfs-modal .ncfs-choice-actions .ncfs-edit{grid-column:1/-1}
    #ncfs-modal .ncfs-choice-actions .ncfs-edit-choice{grid-column:1/-1}
    #ncfs-modal .ncfs-choice-actions button{width:100%}
    #ncfs-modal .ncfs-action-reason{color:#c4a77e;font-size:11px;line-height:1.5;margin-top:5px}
    #ncfs-modal .ncfs-menu-status{font-size:12px;color:#b6c0c8;line-height:1.6;margin:12px 0}
    @media(max-width:420px){#noyeah-cfs-panel .ncfs-slots{gap:5px;margin-left:10px;margin-right:10px}#noyeah-cfs-panel .ncfs-slot{padding:8px 6px}#noyeah-cfs-panel .ncfs-type{font-size:14px}#noyeah-cfs-panel .ncfs-name{font-size:10px}#noyeah-cfs-panel .ncfs-head{padding:10px}#noyeah-cfs-panel .ncfs-image-label{font-size:10px}}
  `;
  document.head.append(style);

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  // Keep this control mounted while telemetry redraws the panel body, so an
  // open native language menu is not interrupted by a temperature update.
  const panelBody = el('div', 'ncfs-body');
  const languageFooter = el('div', 'ncfs-language-footer');
  const languageLabel = el('label'); languageLabel.htmlFor = 'ncfs-language';
  const languageSelect = el('select', 'ncfs-language-select'); languageSelect.id = 'ncfs-language';
  const autoLanguageOption = el('option'); autoLanguageOption.value = 'auto'; languageSelect.append(autoLanguageOption);
  for (const [value, name] of [['en', 'English'], ['ko', '한국어'], ['ja', '日本語'], ['zh', '简体中文'], ['es', 'Español']]) {
    const option = el('option', '', name); option.value = value; languageSelect.append(option);
  }
  languageSelect.onchange = () => {
    if (modal || pending || motion) { languageSelect.value = languageMode; return; }
    languageMode = languageSelect.value === 'auto' ? 'auto' : normalizeLanguage(languageSelect.value);
    setLanguage(languageMode === 'auto' ? mainsailLanguage() : languageMode);
    try { root.localStorage?.setItem('cfsail.languageMode', languageMode); } catch (_) { /* Selection still works for this visit. */ }
    message = ''; messageError = false;
    render();
  };
  languageFooter.append(languageLabel, languageSelect);
  const liveStatus = el('div', 'ncfs-live-status'); liveStatus.setAttribute('role', 'status');
  const statusRow = el('div', 'ncfs-status-row'), activityStatus = el('div', 'ncfs-activity');
  const nozzleStatus = el('div'), faultStatus = el('div', 'error');
  const noticeArea = el('div');
  statusRow.append(activityStatus, languageFooter);
  liveStatus.append(statusRow, nozzleStatus, faultStatus);
  panel.append(panelBody, liveStatus, noticeArea);

  // Adapted from upstream findTargetColumn. Prefer the dashboard's known panels.
  function findTargetColumn() {
    const explicit = document.querySelector('[data-cfsail-mount], [data-noyeah-cfs-mount]');
    if (explicit) return explicit;
    // A native panel can be hidden or moved to another column by Mainsail.
    // Never fall back to a fixed column when its host is absent.
    if (nativeLayout) return null;
    if (!['/', '/dashboard'].includes(location.pathname)) return null;
    const anchor = document.querySelector('main .miniconsole-panel, main .temperature-panel, main .v-card.panel');
    if (anchor?.closest('.col')) return anchor.closest('.col');
    const selectors = ['.v-main__wrap .container .row > [class*="col-"]', '.v-main .container .row > div'];
    for (const selector of selectors) {
      for (const node of document.querySelectorAll(selector)) {
        if (!node.closest('.v-card, .panel, .v-dialog') && node.offsetParent !== null) return node;
      }
    }
    return null;
  }

  function mount() {
    const target = findTargetColumn();
    if (!target) { panel.remove(); closeModal(); return; }
    if (panel.parentElement !== target) target.prepend(panel);
  }

  function canEdit(slot, box) {
    return !!slot && !!box && !reasonFor(slot, box, 'edit');
  }
  function telemetryFresh() {
    return statusFresh({ connected: socketConnected, stateKnown, feedKnown, lastBoxAt });
  }
  function canTransport(slot, box, action) {
    return !!slot && !!box && !reasonFor(slot, box, action);
  }
  function reasonFor(slot, box, action) {
    return actionReason({ connected: socketConnected, cfsConnected: cfsConnected === true,
      boxConnected: !!box?.connected, stateKnown, feedKnown, fresh: telemetryFresh(), readOnly,
      printing, busy, pending: !!pending || !!motion, printerError, error: displayTelemetry.error,
      hasPresets: presets.length > 0 }, slot, action);
  }
  function canChoose(slot, box) {
    // Allow opening a status menu even when actions are blocked, so the reason is visible.
    return !!box && !!slot;
  }

  function render() {
    if (languageMode === 'auto' && !modal && !pending && !motion) {
      const nextLanguage = normalizeLanguage(mainsailLanguage());
      if (nextLanguage !== language) { setLanguage(nextLanguage); message = ''; messageError = false; }
    }
    let box = selectedBox === 0 ? boxes.find(b => b.id === 0) :
      boxes.find(b => b.id === selectedBox) || boxes.find(b => b.id > 0);
    if (selectedBox !== 0 && Array.isArray(info.materialBoxs)) selectedBox = box?.id ?? 0;
    if (selectedBox === 0) box = boxes.find(b => b.id === 0);
    modal?.updateButtons?.();
    const renderKey = JSON.stringify({ boxes, presetIds: presets.map(p => p.id), selectedBox, socketConnected,
      cfsConnected, printing, busy, stateKnown, feedKnown, fresh: telemetryFresh(), pending: !!pending,
      motion, printerError, displayTelemetry, message, messageError, language, languageMode });
    if (renderKey === lastRenderKey) { mount(); return; }
    lastRenderKey = renderKey;
    const focusKey = panel.contains(document.activeElement) ? document.activeElement.dataset.slotKey : null;
    const refreshFocused = panel.contains(document.activeElement) && document.activeElement.dataset.action === 'refresh';
    const focusedSource = panel.contains(document.activeElement) ? document.activeElement.dataset.sourceId : undefined;
    panel.lang = uiLanguage();
    panel.setAttribute('aria-label', t('aria.panel'));
    languageLabel.textContent = t('language.label');
    languageSelect.setAttribute('aria-label', t('language.label'));
    autoLanguageOption.textContent = t('language.auto');
    if (languageSelect.value !== languageMode) languageSelect.value = languageMode;
    languageSelect.disabled = !!pending || !!motion;
    panelBody.replaceChildren();
    const online = socketConnected && (selectedBox === 0 || cfsConnected === true) && !!box?.connected && telemetryFresh();
    const head = el('div', 'ncfs-head');
    const tabs = el('div', 'ncfs-source-tabs'); tabs.setAttribute('role', 'tablist'); tabs.setAttribute('aria-label', t('aria.sources'));
    const tabIds = [...boxes.filter(b => b.id > 0).map(b => b.id), 0];
    for (const id of tabIds) {
      const source = boxes.find(b => b.id === id), active = id === selectedBox;
      const tab = el('button', 'ncfs-source-tab' + (active ? ' active' : '') + (id > 0 && !source?.connected ? ' offline' : ''), id === 0 ? t('external.short') : t('aria.cfs', { id }));
      tab.type = 'button'; tab.dataset.sourceId = id; tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-selected', String(active)); tab.setAttribute('aria-controls', 'ncfs-source-content');
      tab.setAttribute('aria-label', id === 0 ? t('aria.external.tab') : t('aria.cfs', { id })); tab.tabIndex = active ? 0 : -1;
      tab.onclick = () => { closeModal(); selectedBox = id; render(); restoreTitleFocus(); };
      tab.onkeydown = event => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const index = tabIds.indexOf(id), next = event.key === 'Home' ? 0 : event.key === 'End' ? tabIds.length - 1 :
          (index + (event.key === 'ArrowRight' ? 1 : -1) + tabIds.length) % tabIds.length;
        closeModal(); selectedBox = tabIds[next]; render(); restoreTitleFocus();
      };
      tabs.append(tab);
    }
    head.append(tabs);
    const dot = el('span', 'ncfs-dot' + (online ? ' online' : ''));
    const state = !socketConnected ? t('connection.connecting') : !stateKnown || !feedKnown || !lastBoxAt ? t('connection.checking') :
      !telemetryFresh() ? t('connection.delayed') : online ? (selectedBox === 0 ? t('connection.synced') : t('connection.online')) : selectedBox === 0 ? t('connection.noinfo') : t('connection.nocfs');
    head.append(dot, el('span', 'ncfs-status', state));
    const refresh = el('button', 'ncfs-refresh', '↻');
    refresh.dataset.action = 'refresh';
    refresh.type = 'button'; refresh.setAttribute('aria-label', t('aria.refresh'));
    refresh.disabled = !socketConnected;
    refresh.onclick = () => request(true);
    head.append(refresh); panelBody.append(head);
    const content = el('div'); content.id = 'ncfs-source-content'; content.setAttribute('role', 'tabpanel');
    content.setAttribute('aria-label', selectedBox === 0 ? t('external.title') : t('aria.cfs', { id: selectedBox }));
    panelBody.append(content);
    if (selectedBox === 0) {
      renderExternal(content, box, online);
    } else {
    const visual = el('div', 'ncfs-visual');
    const photo = el('img', 'ncfs-photo'); photo.src = imageUrl; photo.alt = t('aria.photo');
    visual.append(photo);
    const svgNS = 'http://www.w3.org/2000/svg';
    const tints = document.createElementNS(svgNS, 'svg');
    tints.classList.add('ncfs-tints'); tints.setAttribute('viewBox', '0 360 1600 920');
    tints.setAttribute('aria-hidden', 'true');
    const masks = [
      '322,501 529,506 536,851 300,851', '579,504 782,505 791,851 561,851',
      '833,505 1030,505 1041,851 816,851', '1086,505 1287,505 1303,851 1064,851'
    ];
    const labels = el('div', 'ncfs-image-labels');
    const slots = box?.slots || letters.map((l, index) => ({ label: '1' + l, index, status: 'empty', type: '', name: '', color: null, selected: false }));
    for (const slot of slots) {
      const tint = document.createElementNS(svgNS, 'polygon'); tint.setAttribute('points', masks[slot.index]);
      tint.setAttribute('fill', online ? slot.color || '#777777' : '#666666');
      tints.append(tint);
      const loaded = isLoaded(slot, { online, fresh: telemetryFresh() });
      const reel = el('button', 'ncfs-reel-hit' + (loaded ? ' selected' : ''));
      reel.type = 'button'; reel.style.left = (20.4 + slot.index * 15.9) + '%';
      reel.setAttribute('aria-label', t('aria.slot.actions', { slot: displaySlotLabel(slot), status: slotStatusText(slot, loaded) }));
      reel.disabled = !canChoose(slot, box); reel.onclick = () => openSlotMenu(slot.boxId, slot.index);
      labels.append(reel);
      const label = el('span', 'ncfs-image-label' + (loaded ? ' selected' : ''), slot.label + (loaded ? ' ●' : ''));
      label.style.left = (20.4 + slot.index * 15.9) + '%'; labels.append(label);
    }
    const temperature = online && box.temp !== null ? box.temp : '—';
    const humidity = online && box.humidity !== null ? box.humidity : '—';
    const lcd = el('div', 'ncfs-lcd');
    lcd.setAttribute('role', 'img');
    lcd.setAttribute('aria-label', t('aria.lcd', { id: box?.id ?? '—', temperature, humidity }));
    const lcdValues = el('span', 'ncfs-lcd-values');
    for (const [value, unit] of [[temperature, '°C'], [humidity, '% RH']]) {
      const row = el('span');
      row.append(el('span', '', value), el('span', 'ncfs-lcd-unit', unit));
      lcdValues.append(row);
    }
    lcd.append(lcdValues, el('span', 'ncfs-lcd-box', box?.id ?? '—'));
    visual.append(tints, labels, lcd); content.append(visual);
    const grid = el('div', 'ncfs-slots');
    const statuses = { empty: t('slot.empty'), unconfigured: t('slot.configure'), feeding: t('slot.loading'), retracting: t('slot.unloading'), rfid: t('slot.rfid'), manual: t('slot.manual') };
    for (const slot of slots) {
      const loaded = isLoaded(slot, { online, fresh: telemetryFresh() });
      const button = el('button', 'ncfs-slot ' + slot.status + (loaded ? ' selected' : ''));
      button.type = 'button';
      button.dataset.slotKey = slot.boxId + ':' + slot.index;
      button.disabled = !canChoose(slot, box);
      button.setAttribute('aria-label', t('aria.slot.detail', { slot: displaySlotLabel(slot), type: slot.type || statuses[slot.status], status: slotStatusText(slot, loaded) }));
      const top = el('span', 'ncfs-slot-top');
      const swatch = el('span', 'ncfs-swatch' + (slot.color ? '' : ' unknown'));
      if (slot.color) swatch.style.backgroundColor = slot.color;
      top.append(el('span', '', slot.label), swatch);
      button.append(top, el('span', 'ncfs-type', slot.status === 'empty' ? '/' : slot.type || '?'),
        el('span', 'ncfs-name', slot.name || (slot.status === 'empty' ? t('slot.empty') : t('slot.unconfigured'))),
        el('span', 'ncfs-tag', loaded ? t('slot.loaded.badge') : statuses[slot.status]));
      button.onclick = () => openSlotMenu(slot.boxId, slot.index);
      grid.append(button);
    }
    content.append(grid);
    }
    const activity = !socketConnected ? t('status.reconnecting') : !telemetryFresh() ?
      (stateKnown && feedKnown ? t('status.delayed') : t('status.checking')) :
      printing ? t('status.printing', { activity: activityText(info, displayTelemetry, motion) }) : activityText(info, displayTelemetry, motion);
    activityStatus.className = 'ncfs-activity' + (busy ? ' busy' : '');
    activityStatus.textContent = activity;
    nozzleStatus.textContent = telemetryFresh() ? nozzleText(displayTelemetry) : t('nozzle.unknown');
    const fault = errorText(displayTelemetry.error);
    faultStatus.textContent = fault; faultStatus.hidden = !fault;
    if (readOnly) panelBody.append(el('div', 'ncfs-hint', t('status.readonly')));
    noticeArea.replaceChildren();
    if (message) {
      const notice = el('div', 'ncfs-notice' + (messageError ? ' error' : ''), message);
      notice.setAttribute('role', messageError ? 'alert' : 'status'); noticeArea.append(notice);
    }
    mount();
    if (focusKey) restoreSlotFocus(focusKey);
    else if (refreshFocused) refresh.focus();
    else if (focusedSource !== undefined) {
      const previous = panel.querySelector('[data-source-id="' + focusedSource + '"]');
      if (previous) previous.focus(); else restoreTitleFocus();
    }
  }

  function restoreSlotFocus(key) {
    const button = [...panel.querySelectorAll('[data-slot-key]')].find(node => node.dataset.slotKey === key);
    if (button && !button.disabled) button.focus();
  }
  function closeModal() { if (modal) modal.remove(); modal = null; }
  function restoreTitleFocus() { panel.querySelector('[data-source-id="' + selectedBox + '"]')?.focus(); }
  function renderExternal(content, box, online) {
    const slot = box?.slots[0], loaded = isLoaded(slot, { online, fresh: telemetryFresh() });
    const visual = el('div', 'ncfs-ext-visual' + (loaded ? ' selected' : ''));
    const spool = el('div', 'ncfs-spool'); spool.setAttribute('role', 'img');
    spool.setAttribute('aria-label', t('aria.spool', { color: slot?.color || t('color.unset') }));
    if (slot?.color) spool.style.setProperty('--spool-color', slot.color);
    visual.append(spool, el('div', 'ncfs-ext-title', t('external.title')),
      el('div', 'ncfs-ext-detail', loaded ? t('slot.loaded.badge') : slot ? t('external.info') : t('external.missing')));
    content.append(visual);
    const card = el('div', 'ncfs-slot ncfs-ext-card' + (loaded ? ' selected' : ''));
    const top = el('div', 'ncfs-slot-top'), swatch = el('span', 'ncfs-swatch' + (slot?.color ? '' : ' unknown'));
    if (slot?.color) swatch.style.backgroundColor = slot.color;
    top.append(el('span', '', t('external.short')), swatch);
    card.append(top, el('div', 'ncfs-type', slot?.type || t('material.unset')), el('div', 'ncfs-name', slot?.name || t('material.configure')));
    const edit = el('button', 'ncfs-ext-action', t('action.edit')); edit.type = 'button'; edit.dataset.slotKey = '0:0';
    const reason = slot ? reasonFor(slot, box, 'edit') : t('external.refresh');
    edit.disabled = !!reason; edit.onclick = () => openEditor(0, 0);
    const reasonNode = el('div', 'ncfs-ext-reason', reason); reasonNode.id = 'ncfs-ext-edit-reason';
    edit.setAttribute('aria-describedby', reasonNode.id); card.append(edit, reasonNode);
    content.append(card, el('div', 'ncfs-hint', t('reason.external.transport')));
  }
  function bindModalKeys(dialog, first, previousFocusKey) {
    modal.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        closeModal();
        if (typeof previousFocusKey === 'function') previousFocusKey(); else restoreSlotFocus(previousFocusKey);
      }
      if (event.key === 'Tab') {
        const fields = [...dialog.querySelectorAll('select,input,button')].filter(n => !n.disabled);
        if (event.shiftKey && document.activeElement === fields[0]) { event.preventDefault(); fields.at(-1)?.focus(); }
        else if (!event.shiftKey && document.activeElement === fields.at(-1)) { event.preventDefault(); fields[0]?.focus(); }
      }
    });
    first?.focus();
  }
  function openSlotMenu(boxId, index) {
    const box = boxes.find(b => b.id === boxId), slot = box?.slots[index];
    if (!slot || !canChoose(slot, box)) return;
    const previousFocusKey = slot.boxId + ':' + slot.index;
    closeModal(); modal = el('div'); modal.id = 'ncfs-modal';
    const dialog = el('div', 'ncfs-dialog'); dialog.setAttribute('role', 'dialog');
    dialog.lang = uiLanguage();
    dialog.setAttribute('aria-modal', 'true'); dialog.setAttribute('aria-labelledby', 'ncfs-action-title');
    const title = el('h2', '', t('menu.title', { slot: displaySlotLabel(slot) })); title.id = 'ncfs-action-title'; dialog.append(title);
    const summary = el('div', 'ncfs-slot-summary'), swatch = el('span', 'ncfs-swatch');
    swatch.style.backgroundColor = slot.color || '#777777';
    const summaryText = el('span'); summary.append(swatch, summaryText);
    const choices = el('div', 'ncfs-choice-actions');
    const load = el('button', 'ncfs-load', t('action.load')), unload = el('button', '', t('action.unload')), edit = el('button', 'ncfs-edit', t('action.edit'));
    for (const button of [load, unload, edit]) button.type = 'button';
    const error = el('div', 'ncfs-form-error'); error.setAttribute('role', 'alert');
    const menuStatus = el('div', 'ncfs-menu-status'); menuStatus.setAttribute('role', 'status');
    const actionItems = [[load,'load'],[unload,'unload'],[edit,'edit']].map(([button,action]) => {
      const wrapper = el('div', action === 'edit' ? 'ncfs-edit-choice' : '');
      const reason = el('div', 'ncfs-action-reason'); reason.id = 'ncfs-reason-' + action;
      button.setAttribute('aria-describedby', reason.id); wrapper.append(button, reason); choices.append(wrapper);
      return {button,action,reason};
    });
    function updateButtons() {
      const currentBox = boxes.find(b => b.id === boxId), current = currentBox?.slots[index];
      for (const item of actionItems) {
        const reason = reasonFor(current, currentBox, item.action);
        item.button.disabled = !!reason; item.reason.textContent = reason;
      }
      swatch.style.backgroundColor = current?.color || '#777777';
      summaryText.textContent = isLoaded(current, { online: socketConnected && cfsConnected === true && !!currentBox?.connected, fresh: telemetryFresh() }) ?
        t('slot.loaded.summary', { name: current?.name || current?.type || t('slot.unconfigured') }) :
        (current?.name || current?.type || (current?.state === 0 ? t('slot.empty') : t('slot.unconfigured')));
      menuStatus.textContent = telemetryFresh() ? t('menu.telemetry', { activity: activityText(info, displayTelemetry, motion), nozzle: nozzleText(displayTelemetry) }) : t('menu.status');
    }
    modal.updateButtons = updateButtons; updateButtons();
    for (const [button, action] of [[load, 'load'], [unload, 'unload']]) button.onclick = () => {
      try { startTransport(boxId, index, action); } catch (err) { error.textContent = err.message; updateButtons(); }
    };
    edit.onclick = () => openEditor(boxId, index);
    const note = el('p', 'ncfs-modal-note', t('menu.note'));
    const actions = el('div', 'ncfs-actions'), close = el('button', '', t('action.close')); close.type = 'button';
    close.onclick = () => { closeModal(); restoreSlotFocus(previousFocusKey); }; actions.append(close);
    dialog.append(summary, menuStatus, choices, note, error, actions); modal.append(dialog); document.body.append(modal);
    bindModalKeys(dialog, [load, unload, edit].find(b => !b.disabled) || close, previousFocusKey);
  }
  function startTransport(boxId, index, action) {
    const box = boxes.find(b => b.id === boxId), slot = box?.slots[index];
    if (!canTransport(slot, box, action) || socket?.readyState !== WebSocket.OPEN)
      throw new Error(t('error.state.changed'));
    const command = buildTransport(slot, action);
    socket.send(JSON.stringify(command));
    motion = { boxId, index, action };
    message = t(action === 'load' ? 'transport.load.sent' : 'transport.unload.sent', { slot: displaySlotLabel(slot) }); messageError = false;
    closeModal(); render();
    // Never retry movement commands automatically, including after disconnects.
    motionTimer = setTimeout(() => finishTransport(false, t('transport.timeout')), 300000);
    queryTimer = setTimeout(() => request(), 350);
  }
  function finishTransport(ok, text) {
    if (!motion) return;
    clearTimeout(motionTimer); clearTimeout(queryTimer); motion = null;
    message = text; messageError = !ok; render();
  }
  function openEditor(boxId, index) {
    const box = boxes.find(b => b.id === boxId), slot = box?.slots[index];
    if (!slot || !canEdit(slot, box)) return;
    closeModal();
    const previousFocusKey = boxId + ':' + index;
    modal = el('div'); modal.id = 'ncfs-modal';
    const dialog = el('form', 'ncfs-dialog');
    dialog.lang = uiLanguage();
    dialog.setAttribute('role', 'dialog'); dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-labelledby', 'ncfs-edit-title');
    const title = el('h2', '', t('editor.title', { slot: displaySlotLabel(slot) })); title.id = 'ncfs-edit-title'; dialog.append(title);
    const typeLabel = el('label', '', t('editor.type'));
    const select = el('select'); select.id = 'ncfs-material-type'; typeLabel.htmlFor = select.id;
    const types = [...new Set(presets.map(p => p.type))];
    for (const type of types) { const option = el('option', '', type); option.value = type; select.append(option); }
    select.value = types.includes(slot.type) ? slot.type : types.includes('PLA') ? 'PLA' : types[0];
    const colorLabel = el('label', '', t('editor.color')); colorLabel.htmlFor = 'ncfs-color-hex';
    const row = el('div', 'ncfs-color-row');
    const picker = el('input'); picker.type = 'color'; picker.value = slot.color || '#FFFFFF'; picker.setAttribute('aria-label', t('aria.color'));
    const hex = el('input'); hex.type = 'text'; hex.id = 'ncfs-color-hex'; hex.value = picker.value.toUpperCase(); hex.maxLength = 7;
    hex.autocomplete = 'off'; hex.spellcheck = false;
    picker.oninput = () => { hex.value = picker.value.toUpperCase(); };
    hex.oninput = () => { const color = normalizeColor(hex.value); if (color) picker.value = color; };
    row.append(picker, hex);
    const palette = el('div', 'ncfs-palette');
    for (const color of ['#FFFFFF', '#000000', '#808080', '#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#007AFF', '#AF52DE', '#FF2D55']) {
      const chip = el('button'); chip.type = 'button'; chip.style.backgroundColor = color;
      chip.setAttribute('aria-label', t('aria.palette', { color })); chip.onclick = () => { picker.value = color; hex.value = color; }; palette.append(chip);
    }
    const note = el('p', 'ncfs-modal-note');
    const choosePreset = () => presets.find(p => p.type === select.value && p.name === 'Generic ' + select.value) || presets.find(p => p.type === select.value);
    const updateNote = () => { note.textContent = t('editor.preset', { preset: choosePreset()?.name || 'Generic' }); };
    select.onchange = updateNote; updateNote();
    const error = el('div', 'ncfs-form-error'); error.setAttribute('role', 'alert');
    const currentInfo = el('p', 'ncfs-modal-note');
    const actions = el('div', 'ncfs-actions');
    const cancel = el('button', '', t('action.cancel')); cancel.type = 'button'; cancel.onclick = () => { closeModal(); restoreSlotFocus(previousFocusKey); };
    const save = el('button', 'ncfs-save', t('action.save')); save.type = 'submit';
    actions.append(cancel, save);
    dialog.append(typeLabel, select, colorLabel, row, palette, note, currentInfo, error, actions);
    dialog.onsubmit = event => {
      event.preventDefault();
      try {
        const currentBox = boxes.find(b => b.id === boxId), current = currentBox?.slots[index];
        if (!current || !canEdit(current, currentBox)) throw new Error(t('error.slot.changed'));
        const edit = buildEdit(current, choosePreset(), hex.value);
        pending = edit; message = t('editor.pending', { slot: displaySlotLabel(current) }); messageError = false;
        socket.send(JSON.stringify(edit));
        closeModal(); render();
        saveTimer = setTimeout(() => finishSave(false, t('editor.timeout')), 10000);
        queryTimer = setTimeout(() => request(), 350);
      } catch (err) { pending = null; message = ''; error.textContent = err.message; }
    };
    modal.updateButtons = () => {
      const currentBox = boxes.find(b => b.id === boxId), current = currentBox?.slots[index];
      const reason = reasonFor(current, currentBox, 'edit');
      save.disabled = !!reason;
      currentInfo.textContent = t(isLoaded(current, { online: socketConnected && (currentBox?.kind === 'external' || cfsConnected === true) && !!currentBox?.connected,
          fresh: telemetryFresh() }) ? 'editor.current.loaded' : 'editor.current',
          { type: current?.type || t('material.unset'), color: current?.color || t('color.unset') });
      if (reason) { error.textContent = reason; error.dataset.stateReason = 'true'; }
      else if (error.dataset.stateReason === 'true') { error.textContent = ''; error.dataset.stateReason = 'false'; }
    };
    modal.updateButtons();
    modal.append(dialog); document.body.append(modal);
    modal.addEventListener('keydown', event => {
      if (event.key === 'Escape') { closeModal(); restoreSlotFocus(previousFocusKey); }
      if (event.key === 'Tab') {
        const fields = [...dialog.querySelectorAll('select,input,button')].filter(n => !n.disabled);
        const first = fields[0], last = fields[fields.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    });
    select.focus();
  }

  function finishSave(ok, text) {
    if (!pending) return;
    clearTimeout(saveTimer); clearTimeout(queryTimer);
    pending = null; message = text; messageError = !ok; render();
  }
  function request(includeMaterials) {
    if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ method: 'get', params: { boxsInfo: 1,
      ReqPrinterPara: 1, ...(includeMaterials ? { reqMaterials: 1 } : {}) } }));
  }
  function connect() {
    if (socket && socket.readyState < 2) return;
    socket = new WebSocket(wsUrl);
    socket.onopen = () => { socketConnected = true; cfsConnected = null; stateKnown = false; feedKnown = false;
      lastBoxAt = 0; feedState = null; printerError = false;
      displayTelemetry = { feedState: null, nozzle: null, target: null, error: null };
      info = {}; boxes = []; presets = []; request(true); render(); };
    socket.onmessage = event => {
      if (String(event.data).includes('heart_beat')) { socket.send('ok'); return; }
      let data; try { data = JSON.parse(event.data); } catch (_) { return; }
      if (!data || typeof data !== 'object') return;
      if ('feedState' in data && !motion && !pending) { message = ''; messageError = false; }
      displayTelemetry = updateDisplayTelemetry(displayTelemetry, data);
      if ('cfsConnect' in data) cfsConnected = Number(data.cfsConnect) > 0;
      if ('feedState' in data) feedState = number(data.feedState);
      if ('err' in data) printerError = number(data.err?.key) !== 0;
      ({ stateKnown, feedKnown, printing, busy } = updateTelemetry({ stateKnown, feedKnown, printing, busy }, data));
      if ('retMaterials' in data) presets = genericPresets(data.retMaterials);
      if ('boxsInfo' in data) { info = data.boxsInfo; boxes = normalizeSources(info); lastBoxAt = Date.now(); }
      if (data.materialState) { info = applyMaterialState(info, data.materialState); boxes = normalizeSources(info); }
      if (data.boxState) {
        const box = (info.materialBoxs || []).find(b => Number(b.id) === Number(data.boxState.id));
        if (box) { Object.assign(box, data.boxState); boxes = normalizeSources(info); }
      }
      if (pending && data.err && Number(data.err.key) !== 0) finishSave(false, errorText(displayTelemetry.error));
      else if (pending && 'boxsInfo' in data && editConfirmed(info, pending)) finishSave(true, t('editor.saved'));
      if (motion) {
        if (printerError) finishTransport(false, errorText(displayTelemetry.error));
        else if (!socketConnected || cfsConnected === false || !boxes.find(b => b.id === motion.boxId)?.connected)
          finishTransport(false, t('transport.cfs.lost'));
        else if (telemetryFresh() && transportConfirmed(info, motion, feedState)) {
          const text = t(motion.action === 'load' ? 'transport.load.done' : 'transport.unload.done', { slot: motion.boxId + letters[motion.index] });
          finishTransport(true, text);
        } else if (busy) {
          message = '';
        }
      }
      render();
    };
    socket.onerror = () => { socketConnected = false; render(); };
    socket.onclose = () => {
      socketConnected = false; closeModal();
      if (pending) finishSave(false, t('editor.disconnected'));
      if (motion) finishTransport(false, t('transport.disconnected'));
      render(); clearTimeout(reconnectTimer); reconnectTimer = setTimeout(connect, 3000);
    };
  }
  render(); connect();
  const poll = setInterval(() => { request(presets.length === 0); render(); }, 3000);
  const layoutObserver = new MutationObserver(mount);
  layoutObserver.observe(document.body, { childList: true, subtree: true });
  root.addEventListener('pagehide', () => {
    clearInterval(poll); clearTimeout(reconnectTimer); clearTimeout(saveTimer); clearTimeout(queryTimer); clearTimeout(motionTimer);
    layoutObserver.disconnect(); if (socket) { socket.onclose = null; socket.close(); }
    closeModal();
  }, { once: true });
})(typeof globalThis !== 'undefined' ? globalThis : this);
