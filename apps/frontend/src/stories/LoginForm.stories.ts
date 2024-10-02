import LoginForm from "@/stories/LoginForm";
import { Meta, StoryObj } from "@storybook/react";
import { fn, userEvent, within } from "@storybook/test";

const meta = {
  component: LoginForm,
} satisfies Meta<typeof LoginForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const TheOneWithDefaults: Story = {};

export const TheOneWithALoginHandler: Story = {
  args: {
    loginHandler: fn((loginDetails) => loginDetails),
  },
};

// ---------------- STORIES FOR ONCE LOGIN HANDLER HAS FIRED ---------------------------

export const TheOneWithEmptyFields: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const loginButton = canvas.getByRole("button");
    await userEvent.click(loginButton);
  },
};

export const TheOneWithAnEmptyPasswordField: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const emailInput = canvas.getByPlaceholderText("Email");
    const loginButton = canvas.getByRole("button");
    await userEvent.type(emailInput, "jon@mail.com");
    await userEvent.click(loginButton);
  },
};

export const TheOneWithAnInvalidEmail: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const emailInput = canvas.getByPlaceholderText("Email");
    const passwordInput = canvas.getByPlaceholderText("Password");
    const loginButton = canvas.getByRole("button");
    await userEvent.type(emailInput, "jon.com");
    await userEvent.type(passwordInput, "Test123$");
    await userEvent.click(loginButton);
  },
};

// ---------------- STORIES AFTER LOGIN HANDLER HAS FIRED ---------------------------

const fillOutLoginFormCorrectly = async (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement);
  const emailInput = canvas.getByPlaceholderText("Email");
  const passwordInput = canvas.getByPlaceholderText("Password");
  await userEvent.type(emailInput, "jon@mail.com");
  await userEvent.type(passwordInput, "Test123$");
  return canvas;
};

export const TheOneWithAPendingLogin: Story = {
  args: {
    loginHandler: fn(
      () =>
        new Promise<void>((resolve) =>
          setTimeout(() => {
            resolve();
          }, 3000)
        )
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = await fillOutLoginFormCorrectly(canvasElement);
    const loginButton = canvas.getByRole("button");
    await userEvent.click(loginButton);
  },
};

export const TheOneWithAnUnsuccessfulLogin: Story = {
  args: {
    loginHandler: fn(
      () =>
        new Promise<"FAILED">((resolve) =>
          setTimeout(() => {
            resolve("FAILED");
          }, 2000)
        )
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = await fillOutLoginFormCorrectly(canvasElement);
    const loginButton = canvas.getByRole("button");
    await userEvent.click(loginButton);
  },
};

export const TheOneWithAnSuccessfulLogin: Story = {
  args: {
    loginHandler: fn(
      () =>
        new Promise<"SUCCESS">((resolve) =>
          setTimeout(() => {
            resolve("SUCCESS");
          }, 2000)
        )
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = await fillOutLoginFormCorrectly(canvasElement);
    const loginButton = canvas.getByRole("button");
    await userEvent.click(loginButton);
  },
};
