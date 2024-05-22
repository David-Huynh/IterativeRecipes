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

/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { useState } from 'react'
import { expect, test } from 'vitest'
import { useDoubleCheck } from './misc.tsx'

function TestComponent() {
	const [defaultPrevented, setDefaultPrevented] = useState<
		'idle' | 'no' | 'yes'
	>('idle')
	const dc = useDoubleCheck()
	return (
		<div>
			<output>Default Prevented: {defaultPrevented}</output>
			<button
				{...dc.getButtonProps({
					onClick: e => setDefaultPrevented(e.defaultPrevented ? 'yes' : 'no'),
				})}
			>
				{dc.doubleCheck ? 'You sure?' : 'Click me'}
			</button>
		</div>
	)
}

test('prevents default on the first click, and does not on the second', async () => {
	const user = userEvent.setup()
	render(<TestComponent />)

	const status = screen.getByRole('status')
	const button = screen.getByRole('button')

	expect(status).toHaveTextContent('Default Prevented: idle')
	expect(button).toHaveTextContent('Click me')

	await user.click(button)
	expect(button).toHaveTextContent('You sure?')
	expect(status).toHaveTextContent('Default Prevented: yes')

	await user.click(button)
	expect(button).toHaveTextContent('You sure?')
	expect(status).toHaveTextContent('Default Prevented: no')
})

test('blurring the button starts things over', async () => {
	const user = userEvent.setup()
	render(<TestComponent />)

	const status = screen.getByRole('status')
	const button = screen.getByRole('button')

	await user.click(button)
	expect(button).toHaveTextContent('You sure?')
	expect(status).toHaveTextContent('Default Prevented: yes')

	await user.click(document.body)
	// button goes back to click me
	expect(button).toHaveTextContent('Click me')
	// our callback wasn't called, so the status doesn't change
	expect(status).toHaveTextContent('Default Prevented: yes')
})

test('hitting "escape" on the input starts things over', async () => {
	const user = userEvent.setup()
	render(<TestComponent />)

	const status = screen.getByRole('status')
	const button = screen.getByRole('button')

	await user.click(button)
	expect(button).toHaveTextContent('You sure?')
	expect(status).toHaveTextContent('Default Prevented: yes')

	await user.keyboard('{Escape}')
	// button goes back to click me
	expect(button).toHaveTextContent('Click me')
	// our callback wasn't called, so the status doesn't change
	expect(status).toHaveTextContent('Default Prevented: yes')
})
