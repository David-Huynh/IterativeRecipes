/*
 * This file is part of Iterative Recipes.
 *
 * Originally created by Kent C. Dodds.
 * Copyright (C) 2024 David Huynh <david@dhuynh.ca>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import * as setCookieParser from 'set-cookie-parser'
import { sessionKey } from '#app/utils/auth.server.ts'
import { authSessionStorage } from '#app/utils/session.server.ts'

export const BASE_URL = 'https://www.recipes.dhuynh.ca'

export function convertSetCookieToCookie(setCookie: string) {
	const parsedCookie = setCookieParser.parseString(setCookie)
	return new URLSearchParams({
		[parsedCookie.name]: parsedCookie.value,
	}).toString()
}

export async function getSessionSetCookieHeader(
	session: { id: string },
	existingCookie?: string,
) {
	const authSession = await authSessionStorage.getSession(existingCookie)
	authSession.set(sessionKey, session.id)
	const setCookieHeader = await authSessionStorage.commitSession(authSession)
	return setCookieHeader
}

export async function getSessionCookieHeader(
	session: { id: string },
	existingCookie?: string,
) {
	const setCookieHeader = await getSessionSetCookieHeader(
		session,
		existingCookie,
	)
	return convertSetCookieToCookie(setCookieHeader)
}
