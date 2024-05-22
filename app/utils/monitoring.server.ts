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

import { ProfilingIntegration } from '@sentry/profiling-node'
import * as Sentry from '@sentry/remix'
import { prisma } from './db.server.ts'

export function init() {
	Sentry.init({
		dsn: ENV.SENTRY_DSN,
		environment: ENV.MODE,
		tracesSampleRate: ENV.MODE === 'production' ? 1 : 0,
		denyUrls: [
			/\/resources\/healthcheck/,
			// TODO: be smarter about the public assets...
			/\/build\//,
			/\/favicons\//,
			/\/img\//,
			/\/fonts\//,
			/\/favicon.ico/,
			/\/site\.webmanifest/,
		],
		integrations: [
			new Sentry.Integrations.Http({ tracing: true }),
			new Sentry.Integrations.Prisma({ client: prisma }),
			new ProfilingIntegration(),
		],
		tracesSampler(samplingContext) {
			// ignore healthcheck transactions by other services (consul, etc.)
			if (samplingContext.request?.url?.includes('/resources/healthcheck')) {
				return 0
			}
			return 1
		},
		beforeSendTransaction(event) {
			// ignore all healthcheck related transactions
			//  note that name of header here is case-sensitive
			if (event.request?.headers?.['x-healthcheck'] === 'true') {
				return null
			}

			return event
		},
	})
}
