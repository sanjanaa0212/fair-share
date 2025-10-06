import { Button, LeftArrowOutlineButton, LoadingButton } from "@/components/ui/button"

export const ButtonsCheck = () => (
  <div className="flex w-full flex-col p-32 gap-20 text-base bg-primary-100">
    <div className="flex gap-10">
      <Button variant="default" size="lg">
        Click me
      </Button>
      <Button variant="default" size="medium">
        Click me
      </Button>
      <Button variant="default" size="sm">
        Click me
      </Button>
      <Button variant="default" size="xs">
        Click me
      </Button>
      <Button variant="default" size="xxs">
        Click me
      </Button>
    </div>
    <div className="flex gap-10">
      <Button variant="secondary" size="lg">
        Click me
      </Button>
      <Button variant="secondary" size="medium">
        Click me
      </Button>
      <Button variant="secondary" size="sm">
        Click me
      </Button>
      <Button variant="secondary" size="xs">
        Click me
      </Button>
      <Button variant="secondary" size="xxs">
        Click me
      </Button>
    </div>

    <div className="flex gap-10">
      <LeftArrowOutlineButton variant="outlineRounded" size="lg">
        Click me
      </LeftArrowOutlineButton>
      <LeftArrowOutlineButton variant="outlineRounded" size="medium">
        Click me
      </LeftArrowOutlineButton>
      <LeftArrowOutlineButton variant="outlineRounded" size="sm">
        Click me
      </LeftArrowOutlineButton>
      <LeftArrowOutlineButton variant="outlineRounded" size="xs">
        Click me
      </LeftArrowOutlineButton>
      <LeftArrowOutlineButton variant="outlineRounded" size="xxs">
        Click me
      </LeftArrowOutlineButton>
    </div>
    <div className="flex gap-10">
      <Button variant="outline" size="lg">
        Click me
      </Button>
      <Button variant="outline" size="medium">
        Click me
      </Button>
      <Button variant="outline" size="sm">
        Click me
      </Button>
      <Button variant="outline" size="xs">
        Click me
      </Button>
      <Button variant="outline" size="xxs">
        Click me
      </Button>
    </div>
    <div className="flex gap-10">
      <LoadingButton loading={true}>Loading Button</LoadingButton>
    </div>
  </div>
)
