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

import * as cookie from 'cookie'

const cookieName = 'en_theme'
export type Theme = 'light' | 'dark'

export function getTheme(request: Request): Theme | null {
	const cookieHeader = request.headers.get('cookie')
	const parsed = cookieHeader ? cookie.parse(cookieHeader)[cookieName] : 'light'
	if (parsed === 'light' || parsed === 'dark') return parsed
	return null
}

export function setTheme(theme: Theme) {
	return cookie.serialize(cookieName, theme, { path: '/', maxAge: 31536000 })
}
