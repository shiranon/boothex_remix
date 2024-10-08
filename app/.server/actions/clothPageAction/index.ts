import { type ActionFunctionArgs, json, redirect } from '@remix-run/cloudflare'
import { loadEnvironment } from '~/lib/utils.server'
import { createClient } from '~/module/supabase/create-client.server'
import { FolderManager } from '~/module/supabase/folder-manager'

/**
 * 衣装ページのアクション関数
 * フォルダの作成や衣装のフォルダへの追加を処理します。
 * @param request - HTTPリクエストオブジェクト
 * @param context - アプリケーションコンテキスト
 * @param params - URLパラメータ
 * @returns アクション結果を含むJSONレスポンス
 */
export const clothPageAction = async ({
	request,
	context,
	params,
}: ActionFunctionArgs) => {
	// 衣装IDの検証
	const { id } = params
	if (!id || !/^\d+$/.test(id)) {
		return json({ success: false, message: '不正なアイテムIDです。' })
	}

	// フォームデータの取得
	const formData = await request.formData()
	if (formData.entries().next().done) {
		return json({ success: false, message: 'フォームに値がありません。' })
	}

	const env = loadEnvironment(context)
	const { supabase } = createClient(request, env)

	// intentの値によって呼び出すフォルダ管理用メソッドを切り替え
	const intent = formData.get('intent')
	switch (intent) {
		case 'createFolder': {
			const folderManager = new FolderManager(supabase)
			await folderManager.initialize()
			const result = await folderManager.createFolder(formData)
			return json(result)
		}
		case 'addFolder': {
			const folderManager = new FolderManager(supabase, id)
			await folderManager.initialize()
			const result = await folderManager.addCloth(formData, id)
			return json(result)
		}
		default: {
			// 未知のintentの場合はエラーをスロー
			throw new Error('予期せぬアクション')
		}
	}
}

export type clothPageAction = typeof clothPageAction
