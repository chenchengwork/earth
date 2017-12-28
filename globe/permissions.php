<?php

trait PermissionCheck
{

    public function check($permission, $user = null, $requirement = null)
    {
        $permission = $this->permissions[$permission];
        switch ($permission['type']) {
            case 'level':
                return $this->checkLevel($requirement, $user);
            case 'none':
                return $this->checkNone();
            case 'multiply':
                return $this->checkMultiple($requirement, $user);
            case 'one':
                return $this->checkOne($requirement, $user);
        }
        return false;
    }
    private function checkLevel($requirement, $user)
    {
        return $user >= $requirement;
    }
    private function checkNone()
    {
        return true;
    }
    private function checkOne($requirement, $user)
    {
        return $requirement == $user;
    }
    private function checkMultiple($requirement, $user)
    {
        $user = explode(',', $user);
        if (!is_array($requirement)) {
            $requirement = [$requirement];
        }

        foreach ($requirement as $item) {
            if (!in_array($item, $user)) {
                return false;
            }
        }
        return true;
    }
}


class Role
{
    use PermissionCheck;

    protected $permissions = [];

    /**
     * @param $permission
     * @param null $value
     * @return bool
     */
    public function can($permission, $value = null)
    {
        return $this->check($permission, $value);
    }
}

class User
{
    use PermissionCheck;


    public function can($permission, $value = null)
    {
        if ($this->role()->can($permission, $value)) {
            return true;
        }
        return $this->check($permission,  $value);
    }

    /**
     * @return Role
     */
    public function role()
    {
        return new Role();
    }
}

