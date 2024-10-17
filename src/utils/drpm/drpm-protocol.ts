export default {
  protocol  : 'https://drpm.tools/protocols/drpm',
  published : true,
  types     : {
    package : {
      schema      : 'https://drpm.tools/schemas/package',
      dataFormats : [
        'application/json'
      ]
    },
    icon : {
      schema      : 'https://areweweb5yet.com/schemas/icon',
      dataFormats : [
        'image/gif',
        'image/png',
        'image/jpeg'
      ]
    },
    release : {
      schema      : 'https://www.rfc-editor.org/rfc/rfc1952.html',
      dataFormats : [
        'application/octet-stream'
      ]
    },
    admin : {
      schema      : 'https://areweweb5yet.com/schemas/admin',
      dataFormats : [
        'application/json'
      ]
    }
  },
  structure : {
    package : {
      $tags : {
        name : {
          type : 'string'
        },
        $requiredTags : [
          'name'
        ]
      },
      $actions : [
        {
          who : 'author',
          of    : 'package',
          can : [
            'create',
            'update',
            'delete'
          ]
        },
        {
          role : 'package/admin',
          can    : [
            'co-update'
          ]
        }
      ],
      admin : {
        $role    : true,
        $actions : [
          {
            who   : 'author',
            of    : 'package',
            can : [
              'create',
              'update',
              'delete'
            ]
          }
        ]
      },
      icon : {
        $actions : [
          {
            who : 'author',
            of    : 'package',
            can : [
              'create',
              'update',
              'delete',
              'co-update',
              'co-delete'
            ]
          },
          {
            role : 'package/admin',
            can    : [
              'create',
              'update',
              'delete',
              'co-update',
              'co-delete'
            ]
          }
        ]
      },
      release : {
        $tags : {
          version : {
            type : 'string'
          },
          integrity : {
            type : 'string'
          },
          $requiredTags : [
            'version',
            'integrity'
          ]
        },
        $actions : [
          {
            who : 'author',
            of    : 'package',
            can : [
              'create',
              'update',
              'delete'
            ]
          },
          {
            role : 'package/admin',
            can    : [
              'create',
              'update',
              'delete'
            ]
          }
        ]
      }
    }
  }
};