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

import { createCookieSessionStorage } from '@remix-run/node'
import { type ProviderName } from './connections.tsx'
import { GitHubProvider } from './providers/github.server.ts'
import { type AuthProvider } from './providers/provider.ts'
import { type Timings } from './timing.server.ts'

export const connectionSessionStorage = createCookieSessionStorage({
	cookie: {
		name: 'en_connection',
		sameSite: 'lax', // CSRF protection is advised if changing to 'none'
		path: '/',
		httpOnly: true,
		maxAge: 60 * 10, // 10 minutes
		secrets: process.env.SESSION_SECRET.split(','),
		secure: process.env.NODE_ENV === 'production',
	},
})

export const providers: Record<ProviderName, AuthProvider> = {
	github: new GitHubProvider(),
}

export function handleMockAction(providerName: ProviderName, request: Request) {
	return providers[providerName].handleMockAction(request)
}

export function resolveConnectionData(
	providerName: ProviderName,
	providerId: string,
	options?: { timings?: Timings },
) {
	return providers[providerName].resolveConnectionData(providerId, options)
}

