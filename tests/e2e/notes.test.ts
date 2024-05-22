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

import { faker } from '@faker-js/faker'
import { prisma } from '#app/utils/db.server.ts'
import { expect, test } from '#tests/playwright-utils.ts'

test('Users can create notes', async ({ page, login }) => {
	const user = await login()
	await page.goto(`/users/${user.username}/notes`)

	const newNote = createNote()
	await page.getByRole('link', { name: /New Note/i }).click()

	// fill in form and submit
	await page.getByRole('textbox', { name: /title/i }).fill(newNote.title)
	await page.getByRole('textbox', { name: /content/i }).fill(newNote.content)

	await page.getByRole('button', { name: /submit/i }).click()
	await expect(page).toHaveURL(new RegExp(`/users/${user.username}/notes/.*`))
})

test('Users can edit notes', async ({ page, login }) => {
	const user = await login()

	const note = await prisma.note.create({
		select: { id: true },
		data: { ...createNote(), ownerId: user.id },
	})
	await page.goto(`/users/${user.username}/notes/${note.id}`)

	// edit the note
	await page.getByRole('link', { name: 'Edit', exact: true }).click()
	const updatedNote = createNote()
	await page.getByRole('textbox', { name: /title/i }).fill(updatedNote.title)
	await page
		.getByRole('textbox', { name: /content/i })
		.fill(updatedNote.content)
	await page.getByRole('button', { name: /submit/i }).click()

	await expect(page).toHaveURL(new RegExp(`/users/${user.username}/notes/.*`))
	await expect(
		page.getByRole('heading', { name: updatedNote.title }),
	).toBeVisible()
})

test('Users can delete notes', async ({ page, login }) => {
	const user = await login()

	const note = await prisma.note.create({
		select: { id: true },
		data: { ...createNote(), ownerId: user.id },
	})
	await page.goto(`/users/${user.username}/notes/${note.id}`)

	// find links with href prefix
	const noteLinks = page
		.getByRole('main')
		.getByRole('list')
		.getByRole('listitem')
		.getByRole('link')
	const countBefore = await noteLinks.count()
	await page.getByRole('button', { name: /delete/i }).click()
	await expect(
		page.getByText('Your note has been deleted.', { exact: true }),
	).toBeVisible()
	await expect(page).toHaveURL(`/users/${user.username}/notes`)
	const countAfter = await noteLinks.count()
	expect(countAfter).toEqual(countBefore - 1)
})

function createNote() {
	return {
		title: faker.lorem.words(3),
		content: faker.lorem.paragraphs(3),
	}
}
